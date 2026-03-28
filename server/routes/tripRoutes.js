const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { tripLimiter } = require('../middleware/rateLimiter');
const { getWeatherByCity } = require('../services/weatherService');
const { getCountryByName } = require('../services/countryService');
const { getExchangeRate, convertAmount, getSupportedCurrencies } = require('../services/currencyService');
const { getFlights, getFlightStatus } = require('../services/flightService');
const { getRoute, getWeatherStops, getCountryFromCity } = require('../services/routeService');
const { getCarbonFootprint, getComparisonForDistance } = require('../services/carbonService');
const { getNewsByCity, getNewsByTopic } = require('../services/newsService');
const { createTrip, getTripBriefing, getSavedTrips, deleteTrip, getQuickBriefing } = require('../controllers/tripController');

// GET /api/trip/weather/:city
router.get('/weather/:city', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { city } = req.params;
    if (!city) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }

    const result = await getWeatherByCity(city);
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/country/:name
router.get('/country/:name', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Country name is required' });
    }

    const result = await getCountryByName(name);
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/currency/convert (must be before /:from/:to)
router.get('/currency/convert', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({ success: false, message: 'from, to and amount are required' });
    }
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    const result = await convertAmount(from, to, parseFloat(amount));
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/currency/:from/:to
router.get('/currency/:from/:to', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { from, to } = req.params;
    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'From and to currencies are required' });
    }

    const result = await getExchangeRate(from, to);
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/currencies
router.get('/currencies', verifyToken, async (req, res, next) => {
  try {
    const result = await getSupportedCurrencies();
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/flights
router.get('/flights', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { source, destination, date } = req.query;
    if (!source || !destination) {
      return res.status(400).json({ success: false, message: 'source and destination are required' });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: 'date is required (YYYY-MM-DD)' });
    }

    const result = await getFlights(source, destination, date);
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/flight-status
router.get('/flight-status', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { flightNumber, date } = req.query;
    if (!flightNumber || !date) {
      return res.status(400).json({ success: false, message: 'flightNumber and date are required' });
    }

    const result = await getFlightStatus(flightNumber, date);
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/route
router.get('/route', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { source, destination } = req.query;
    if (!source || !destination) {
      return res.status(400).json({ success: false, message: 'source and destination are required' });
    }

    const result = await getRoute(source, destination);
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/carbon/compare (must be before /carbon/:mode)
router.get('/carbon/compare', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { distance } = req.query;
    if (!distance || isNaN(distance) || distance <= 0) {
      return res.status(400).json({ success: false, message: 'Valid distance is required' });
    }

    const result = await getComparisonForDistance(parseFloat(distance));
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/carbon
router.get('/carbon', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { mode, distance } = req.query;
    if (!distance) {
      return res.status(400).json({ success: false, message: 'distance is required' });
    }
    if (isNaN(distance) || distance <= 0) {
      return res.status(400).json({ success: false, message: 'distance must be a positive number' });
    }

    const result = await getCarbonFootprint(mode || 'car', parseFloat(distance));
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/news/topic/:topic (must be before /news/:city)
router.get('/news/topic/:topic', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { topic } = req.params;
    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const result = await getNewsByTopic(topic);
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trip/news/:city
router.get('/news/:city', verifyToken, tripLimiter, async (req, res, next) => {
  try {
    const { city } = req.params;
    if (!city) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }

    const result = await getNewsByCity(city);
    return res.status(200).json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/trip/create
router.post('/create', verifyToken, tripLimiter, createTrip);

// GET /api/trip/briefing/:tripId
router.get('/briefing/:tripId', verifyToken, getTripBriefing);

// GET /api/trip/saved
router.get('/saved', verifyToken, getSavedTrips);

// DELETE /api/trip/:tripId
router.delete('/:tripId', verifyToken, deleteTrip);

// GET /api/trip/quick
router.get('/quick', verifyToken, tripLimiter, getQuickBriefing);

// GET /api/trip/stream — SSE endpoint
router.get('/stream', verifyToken, tripLimiter, async (req, res) => {
  const { source, destination, destinationCountry, date, mode } = req.query;

  if (!source || !destination) {
    return res.status(400).json({ success: false, message: 'source and destination required' });
  }
  if (!mode || !['flight', 'road'].includes(mode)) {
    return res.status(400).json({ success: false, message: 'mode must be flight or road' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders();

  // Helper to send SSE events
  const sendEvent = (type, data) => {
    if (!res.writableEnded) {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  // Handle client disconnect
  req.on('close', () => {
    console.log('SSE client disconnected');
  });

  try {
    sendEvent('connected', { message: 'Stream connected', mode, source, destination });

    const tripDate = date || new Date().toISOString().split('T')[0];

    // Build all promises — each resolves and sends event independently
    // NO duplicate calls — each service called exactly once

    const weatherPromise = getWeatherByCity(destination)
      .then(result => sendEvent('weather', { success: true, data: result.data, source: result.source }))
      .catch(err => sendEvent('weather', { success: false, error: err.message }));

    const countryNamePromise = destinationCountry
      ? Promise.resolve(destinationCountry)
      : getCountryFromCity(destination)

    const countryPromise = countryNamePromise
      .then(countryName => getCountryByName(countryName))
      .then(result => sendEvent('country', { success: true, data: result.data, source: result.source }))
      .catch(err => sendEvent('country', { success: false, error: err.message }));

    const currencyPromise = getExchangeRate('INR', 'USD')
      .then(result => sendEvent('currency', { success: true, data: result.data, source: result.source }))
      .catch(err => sendEvent('currency', { success: false, error: err.message }));

    const newsPromise = getNewsByCity(destination)
      .then(result => sendEvent('news', { success: true, data: result.data, source: result.source }))
      .catch(err => sendEvent('news', { success: false, error: err.message }));

    // Transport promise — flight or road
    let transportPromise;
    if (mode === 'flight') {
      transportPromise = getFlights(source, destination, tripDate)
        .then(result => sendEvent('flights', { success: true, data: result.data, source: result.source }))
        .catch(err => sendEvent('flights', { success: false, error: err.message }));
    } else {
      transportPromise = getRoute(source, destination)
        .then(result => {
          sendEvent('route', { success: true, data: result.data, source: result.source });
          return result;
        })
        .catch(err => {
          sendEvent('route', { success: false, error: err.message });
          return null;
        });
    }

    // Carbon promise — depends on mode
    // For road: chain after route to get actual distance
    // For flight: run independently with estimated distance
    let carbonPromise;
    if (mode === 'flight') {
      carbonPromise = getCarbonFootprint('flight', 800)
        .then(result => sendEvent('carbon', { success: true, data: result.data, source: result.source }))
        .catch(err => sendEvent('carbon', { success: false, error: err.message }));
    } else {
      carbonPromise = transportPromise
        .then(async (routeResult) => {
          const distanceKm = routeResult?.data?.distanceKm || 500;
          const carbon = await getCarbonFootprint('car', distanceKm);
          sendEvent('carbon', { success: true, data: carbon.data, source: carbon.source });
        })
        .catch(err => sendEvent('carbon', { success: false, error: err.message }));
    }

    // Wait for ALL promises before sending done
    await Promise.allSettled([
      weatherPromise,
      countryPromise,
      currencyPromise,
      newsPromise,
      transportPromise,
      carbonPromise
    ]);

    sendEvent('done', {
      message: 'All data loaded',
      timestamp: new Date().toISOString()
    });

    res.end();

  } catch (err) {
    sendEvent('error', { message: err.message });
    res.end();
  }
});

module.exports = router;
