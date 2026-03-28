const axios = require('axios');
const fetchWithFallback = require('../utils/fetchWithFallback');
const { mockFlightData } = require('../utils/mockData');
const { AVIATIONSTACK_API_KEY, USE_MOCK_FLIGHTS } = require('../config/env');

const BASE_URL = 'http://api.aviationstack.com/v1';
const CACHE_TTL = 600; // 10 minutes

function calculateDuration(departure, arrival) {
  if (!departure || !arrival) return 'N/A';
  const depTime = new Date(departure);
  const arrTime = new Date(arrival);
  if (isNaN(depTime) || isNaN(arrTime)) return 'N/A';
  const diff = arrTime - depTime;
  if (diff <= 0) return 'N/A';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function formatTime(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  if (isNaN(date)) return 'N/A';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

const getFlights = async (source, destination, date) => {
  if (USE_MOCK_FLIGHTS) {
    console.log('Using mock flight data — USE_MOCK_FLIGHTS=true');
    return { data: mockFlightData(source, destination), source: 'mock' };
  }

  if (!AVIATIONSTACK_API_KEY) {
    console.warn('No Aviationstack API key — falling back to mock');
    return { data: mockFlightData(source, destination), source: 'mock' };
  }

  const cacheKey = `flight:${source.toLowerCase()}:${destination.toLowerCase()}:${date}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      const response = await axios.get(`${BASE_URL}/flights`, {
        params: {
          access_key: AVIATIONSTACK_API_KEY,
          dep_iata: source.toUpperCase(),
          arr_iata: destination.toUpperCase(),
          flight_date: date,
          limit: 10
        }
      });

      // Validate response structure
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response structure from Aviationstack');
      }

      if (response.data.data.length === 0) {
        throw new Error('No flights found for this route and date');
      }

      const flights = response.data.data.map(flight => ({
        flightNumber: flight.flight?.iata || 'N/A',
        airline: flight.airline?.name || 'Unknown',
        departure: formatTime(flight.departure?.scheduled),
        arrival: formatTime(flight.arrival?.scheduled),
        duration: calculateDuration(
          flight.departure?.scheduled,
          flight.arrival?.scheduled
        ),
        status: flight.flight_status || 'Scheduled',
        terminal: flight.departure?.terminal || 'N/A',
        gate: flight.departure?.gate || 'N/A',
        aircraft: flight.aircraft?.iata || 'N/A',
        delay: flight.departure?.delay || 0
      }));

      return {
        source: source.toUpperCase(),
        destination: destination.toUpperCase(),
        date,
        flights,
        total: flights.length,
        isMock: false
      };
    },
    () => mockFlightData(source, destination)
  );
};

const getFlightStatus = async (flightNumber, date) => {
  if (USE_MOCK_FLIGHTS) {
    return {
      data: {
        flightNumber,
        status: 'Scheduled',
        departure: { scheduled: '10:00', terminal: 'T1', gate: 'G5', delay: 0 },
        arrival: { scheduled: '12:00', terminal: 'T2', gate: 'G8', delay: 0 },
        airline: 'Mock Airline',
        aircraft: 'B737',
        isMock: true
      },
      source: 'mock'
    };
  }

  if (!AVIATIONSTACK_API_KEY) {
    return {
      data: {
        flightNumber,
        status: 'Scheduled',
        departure: { scheduled: '10:00', terminal: 'T1', gate: 'G5', delay: 0 },
        arrival: { scheduled: '12:00', terminal: 'T2', gate: 'G8', delay: 0 },
        airline: 'Mock Airline',
        aircraft: 'B737',
        isMock: true
      },
      source: 'mock'
    };
  }

  const cacheKey = `flightstatus:${flightNumber.toLowerCase()}:${date}`;

  return fetchWithFallback(
    cacheKey,
    300, // 5 min cache for live status
    async () => {
      const response = await axios.get(`${BASE_URL}/flights`, {
        params: {
          access_key: AVIATIONSTACK_API_KEY,
          flight_iata: flightNumber.toUpperCase(),
          flight_date: date,
          limit: 1
        }
      });

      if (!response.data?.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
        throw new Error('Flight not found');
      }

      const flight = response.data.data[0];

      return {
        flightNumber: flight.flight?.iata || flightNumber,
        airline: flight.airline?.name || 'Unknown',
        status: flight.flight_status || 'Unknown',
        departure: {
          airport: flight.departure?.airport || 'N/A',
          iata: flight.departure?.iata || 'N/A',
          scheduled: formatTime(flight.departure?.scheduled),
          actual: flight.departure?.actual
            ? formatTime(flight.departure.actual)
            : null,
          terminal: flight.departure?.terminal || 'N/A',
          gate: flight.departure?.gate || 'N/A',
          delay: flight.departure?.delay || 0
        },
        arrival: {
          airport: flight.arrival?.airport || 'N/A',
          iata: flight.arrival?.iata || 'N/A',
          scheduled: formatTime(flight.arrival?.scheduled),
          actual: flight.arrival?.actual
            ? formatTime(flight.arrival.actual)
            : null,
          terminal: flight.arrival?.terminal || 'N/A',
          gate: flight.arrival?.gate || 'N/A',
          delay: flight.arrival?.delay || 0
        },
        aircraft: flight.aircraft?.iata || 'N/A',
        isMock: false
      };
    },
    () => ({
      flightNumber,
      status: 'Scheduled',
      departure: { scheduled: '10:00', terminal: 'T1', gate: 'G5', delay: 0 },
      arrival: { scheduled: '12:00', terminal: 'T2', gate: 'G8', delay: 0 },
      airline: 'Unknown',
      aircraft: 'N/A',
      isMock: true
    })
  );
};

module.exports = { getFlights, getFlightStatus };
