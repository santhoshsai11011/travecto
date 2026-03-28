const axios = require('axios');
const fetchWithFallback = require('../utils/fetchWithFallback');
const { OPENROUTESERVICE_API_KEY } = require('../config/env');

const BASE_URL = 'https://api.openrouteservice.org';
const CACHE_TTL = 43200; // 12 hours

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateFuelCost(distanceKm) {
  const avgMileage = 15; // km per litre
  const petrolPrice = 103; // INR per litre
  const litresNeeded = distanceKm / avgMileage;
  const cost = litresNeeded * petrolPrice;
  return {
    litresNeeded: parseFloat(litresNeeded.toFixed(2)),
    costINR: parseFloat(cost.toFixed(2)),
    pricePerLitre: petrolPrice,
    avgMileageKmpl: avgMileage
  };
}

function calculateDrivingTime(distanceKm) {
  const avgSpeed = 60; // km/h Indian roads average
  const hours = distanceKm / avgSpeed;
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return {
    hours: wholeHours,
    minutes,
    formatted: `${wholeHours}h ${minutes}m`,
    totalMinutes: Math.round(hours * 60)
  };
}

async function geocodeCity(cityName) {
  await sleep(1100); // Respect Nominatim 1 req/sec limit
  const response = await axios.get(
    'https://nominatim.openstreetmap.org/search',
    {
      params: {
        q: cityName + ', India',
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Travecto/1.0 (travel briefing app)'
      }
    }
  );
  if (!response.data || response.data.length === 0) {
    throw new Error(`City not found: ${cityName}`);
  }
  return {
    lat: parseFloat(response.data[0].lat),
    lon: parseFloat(response.data[0].lon),
    displayName: response.data[0].display_name
  };
}

async function getCountryFromCity(cityName) {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: cityName,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: { 'User-Agent': 'Travecto/1.0' }
      }
    );

    if (!response.data || response.data.length === 0) {
      return 'India';
    }

    const country = response.data[0].address?.country;
    return country || 'India';
  } catch {
    return 'India';
  }
}

const getRoute = async (sourceCity, destinationCity) => {
  const cacheKey = `route:${sourceCity.toLowerCase().trim()}:${destinationCity.toLowerCase().trim()}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      // Geocode both cities sequentially with delay
      // to respect Nominatim rate limit
      const sourceCoords = await geocodeCity(sourceCity);
      await sleep(1100); // wait before second request
      const destCoords = await geocodeCity(destinationCity);

      // Get route from OpenRouteService
      // Note: Authorization header does NOT use Bearer prefix
      const response = await axios.post(
        `${BASE_URL}/v2/directions/driving-car`,
        {
          coordinates: [
            [sourceCoords.lon, sourceCoords.lat],
            [destCoords.lon, destCoords.lat]
          ]
        },
        {
          headers: {
            'Authorization': OPENROUTESERVICE_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.data?.routes?.length) {
        throw new Error('No route found between these cities');
      }

      const route = response.data.routes[0];
      const distanceKm = parseFloat((route.summary.distance / 1000).toFixed(2));
      const fuelCost = calculateFuelCost(distanceKm);
      const drivingTime = calculateDrivingTime(distanceKm);

      const segments = route.segments?.map(seg => ({
        distance: parseFloat((seg.distance / 1000).toFixed(2)),
        duration: Math.round(seg.duration / 60)
      })) || [];

      return {
        source: sourceCity,
        destination: destinationCity,
        sourceCoords: { lat: sourceCoords.lat, lon: sourceCoords.lon },
        destCoords: { lat: destCoords.lat, lon: destCoords.lon },
        distanceKm,
        drivingTime,
        fuelCost,
        segments,
        bbox: response.data.bbox || null,
        isMock: false
      };
    },
    () => ({
      source: sourceCity,
      destination: destinationCity,
      sourceCoords: { lat: 17.3850, lon: 78.4867 },
      destCoords: { lat: 19.0760, lon: 72.8777 },
      distanceKm: 710,
      drivingTime: calculateDrivingTime(710),
      fuelCost: calculateFuelCost(710),
      segments: [],
      isMock: true
    })
  );
};

const getWeatherStops = async (sourceCity, destinationCity, distanceKm) => {
  const numStops = distanceKm > 500 ? 2 : distanceKm > 200 ? 1 : 0;
  if (numStops === 0) return [];

  const stops = [
    { city: sourceCity, type: 'start', weather: null }
  ];
  if (numStops >= 1) {
    stops.push({ city: 'Midpoint', type: 'stop', weather: null });
  }
  if (numStops >= 2) {
    stops.push({ city: 'Waypoint 2', type: 'stop', weather: null });
  }
  stops.push({ city: destinationCity, type: 'end', weather: null });

  // Note: weather: null will be enriched in tripController
  return stops;
};

module.exports = {
  getRoute,
  geocodeCity,
  getCountryFromCity,
  getWeatherStops,
  calculateFuelCost,
  calculateDrivingTime
};
