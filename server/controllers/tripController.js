const Trip = require('../models/Trip');
const { addTripJob } = require('../jobs/tripQueue');
const { generatePackingList } = require('../utils/packingList');
const { getWeatherByCity } = require('../services/weatherService');
const { getCountryByName } = require('../services/countryService');
const { getExchangeRate } = require('../services/currencyService');
const { getFlights } = require('../services/flightService');
const { getRoute } = require('../services/routeService');
const { getCarbonFootprint } = require('../services/carbonService');
const { getNewsByCity } = require('../services/newsService');

const createTrip = async (req, res, next) => {
  try {
    const { source, destination, date, mode, tripDuration, currency } = req.body;
    const userId = req.user.id;

    if (!source || !destination || !mode) {
      return res.status(400).json({ success: false, message: 'source, destination and mode are required' });
    }
    if (!['flight', 'road'].includes(mode)) {
      return res.status(400).json({ success: false, message: 'mode must be flight or road' });
    }

    const trip = await Trip.create({
      userId,
      source: source.trim(),
      destination: destination.trim(),
      date: date ? new Date(date) : null,
      mode,
      briefingData: {}
    });

    await addTripJob({
      userId,
      source,
      destination,
      date: date || new Date().toISOString().split('T')[0],
      mode,
      tripId: trip._id.toString()
    });

    return res.status(201).json({
      success: true,
      message: 'Trip created. Briefing is being prepared.',
      tripId: trip._id,
      estimatedTime: '30-60 seconds'
    });
  } catch (error) {
    next(error);
  }
};

const getTripBriefing = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const trip = await Trip.findOne({ _id: tripId, userId });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const hasBriefing = trip.briefingData &&
                        Object.keys(trip.briefingData).length > 0;

    if (!hasBriefing) {
      return res.status(202).json({
        success: true,
        message: 'Briefing is still being prepared',
        status: 'processing',
        tripId
      });
    }

    // Calculate trip duration safely — always at least 1 day
    let tripDurationDays = 3; // default
    if (trip.date) {
      const diff = Math.ceil(
        (new Date(trip.date) - new Date()) / (1000 * 60 * 60 * 24)
      );
      tripDurationDays = Math.max(1, Math.min(diff, 14));
    }

    const weatherData = trip.briefingData.weather || {};

    const packingList = generatePackingList(
      weatherData,
      tripDurationDays,
      trip.mode,
      trip.destination
    );

    return res.status(200).json({
      success: true,
      trip: {
        id: trip._id,
        source: trip.source,
        destination: trip.destination,
        date: trip.date,
        mode: trip.mode,
        createdAt: trip.createdAt
      },
      briefing: {
        ...trip.briefingData,
        packingList
      }
    });
  } catch (error) {
    next(error);
  }
};

const getSavedTrips = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [trips, total] = await Promise.all([
      Trip.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-briefingData'),
      Trip.countDocuments({ userId })
    ]);

    return res.status(200).json({
      success: true,
      trips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const trip = await Trip.findOneAndDelete({ _id: tripId, userId });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getQuickBriefing = async (req, res, next) => {
  try {
    const { source, destination, date, mode, duration, currency: currencyTo } = req.query;

    if (!source || !destination || !mode) {
      return res.status(400).json({
        success: false,
        message: 'source, destination and mode are required'
      });
    }

    if (!['flight', 'road'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'mode must be flight or road'
      });
    }

    // Fetch weather, country, news, currency in parallel
    const [weatherResult, countryResult, newsResult, currencyResult] =
      await Promise.allSettled([
        getWeatherByCity(destination),
        getCountryByName(destination),
        getNewsByCity(destination),
        getExchangeRate('INR', currencyTo || 'USD')
      ]);

    const weather = weatherResult.status === 'fulfilled'
      ? weatherResult.value.data : null;
    const country = countryResult.status === 'fulfilled'
      ? countryResult.value.data : null;
    const news = newsResult.status === 'fulfilled'
      ? newsResult.value.data : null;
    const currency = currencyResult.status === 'fulfilled'
      ? currencyResult.value.data : null;

    // Transport + Carbon based on mode
    let transportData = null;
    let carbonData = null;
    let distanceKm = 800; // default for flight

    try {
      if (mode === 'flight') {
        const tripDate = date || new Date().toISOString().split('T')[0];
        const flightsResult = await getFlights(source, destination, tripDate);
        transportData = { type: 'flight', data: flightsResult.data };

        // Estimate flight distance from route (80% of road distance)
        try {
          const routeResult = await getRoute(source, destination);
          distanceKm = Math.round((routeResult.data?.distanceKm || 1000) * 0.8);
        } catch {
          distanceKm = 800; // keep default
        }

        const carbonResult = await getCarbonFootprint('flight', distanceKm);
        carbonData = carbonResult.data;

      } else {
        const routeResult = await getRoute(source, destination);
        transportData = { type: 'road', data: routeResult.data };
        distanceKm = routeResult.data?.distanceKm || 500;

        const carbonResult = await getCarbonFootprint('car', distanceKm);
        carbonData = carbonResult.data;
      }
    } catch (transportError) {
      console.error('Transport fetch failed:', transportError.message);
      // Continue without transport data
    }

    // Generate packing list
    const packingList = generatePackingList(
      weather || {},
      Math.max(1, parseInt(duration) || 3),
      mode,
      destination
    );

    return res.status(200).json({
      success: true,
      source,
      destination,
      mode,
      briefing: {
        weather,
        country,
        news,
        currency,
        transport: transportData,
        carbon: carbonData,
        packingList
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTrip, getTripBriefing, getSavedTrips, deleteTrip, getQuickBriefing };
