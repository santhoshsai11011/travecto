const { Worker } = require('bullmq');
const { REDIS_URL } = require('../config/env');
const { getWeatherByCity } = require('../services/weatherService');
const { getCountryByName } = require('../services/countryService');
const { getExchangeRate } = require('../services/currencyService');
const { getFlights } = require('../services/flightService');
const { getRoute } = require('../services/routeService');
const { getCarbonFootprint } = require('../services/carbonService');
const { getNewsByCity } = require('../services/newsService');
const Trip = require('../models/Trip');

const connection = new (require('ioredis'))(REDIS_URL, {
  maxRetriesPerRequest: null
});

const tripWorker = new Worker(
  'trip-briefing',
  async (job) => {
    const { userId, source, destination, date, mode, tripId } = job.data;
    console.log(`🔄 Processing trip job: ${job.id}`);

    await job.updateProgress(0);

    const results = {};
    const errors = {};

    // Step 1: Weather (15%)
    try {
      const weather = await getWeatherByCity(destination);
      results.weather = weather.data;
    } catch (err) {
      errors.weather = err.message;
      results.weather = null;
    }
    await job.updateProgress(15);

    // Step 2: Country (30%)
    try {
      const country = await getCountryByName(destination);
      results.country = country.data;
    } catch (err) {
      errors.country = err.message;
      results.country = null;
    }
    await job.updateProgress(30);

    // Step 3: Currency (45%)
    try {
      const currency = await getExchangeRate('INR', 'USD');
      results.currency = currency.data;
    } catch (err) {
      errors.currency = err.message;
      results.currency = null;
    }
    await job.updateProgress(45);

    // Step 4: News (60%)
    try {
      const news = await getNewsByCity(destination);
      results.news = news.data;
    } catch (err) {
      errors.news = err.message;
      results.news = null;
    }
    await job.updateProgress(60);

    // Step 5: Transport + Carbon (80%)
    try {
      if (mode === 'flight') {
        const flights = await getFlights(source, destination, date);
        results.flights = flights.data;

        // Use actual flight distance from route if available
        // otherwise estimate based on coords or default
        let flightDistanceKm = 800; // default
        try {
          const routeData = await getRoute(source, destination);
          // Flight distance is roughly 80% of road distance
          flightDistanceKm = Math.round((routeData.data?.distanceKm || 1000) * 0.8);
        } catch {
          // Keep default if route fails
        }

        const carbon = await getCarbonFootprint('flight', flightDistanceKm);
        results.carbon = carbon.data;

      } else {
        const route = await getRoute(source, destination);
        results.route = route.data;

        // Use actual distance from route
        const distanceKm = route.data?.distanceKm || 500;
        const carbon = await getCarbonFootprint('car', distanceKm);
        results.carbon = carbon.data;
      }
    } catch (err) {
      errors.transport = err.message;
      results.flights = null;
      results.route = null;
      results.carbon = null;
    }
    await job.updateProgress(80);

    // Step 6: Save to MongoDB (100%)
    try {
      await Trip.findByIdAndUpdate(
        tripId,
        {
          briefingData: { ...results, errors },
          updatedAt: new Date()
        },
        { new: true }
      );
      console.log(`💾 Trip ${tripId} saved to MongoDB`);
    } catch (err) {
      console.error('Failed to save trip briefing:', err.message);
    }
    await job.updateProgress(100);

    console.log(`✅ Trip job ${job.id} completed`);
    return { tripId, results, errors };
  },
  {
    connection,
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 60000
    }
  }
);

tripWorker.on('completed', (job) => {
  console.log(`✅ Worker completed job: ${job.id}`);
});

tripWorker.on('failed', (job, err) => {
  console.error(`❌ Worker failed job: ${job?.id}`, err.message);
});

tripWorker.on('error', (err) => {
  console.error('❌ Worker error:', err.message);
});

module.exports = tripWorker;
