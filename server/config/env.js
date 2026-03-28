const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const REDIS_URL = process.env.REDIS_URL;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const NODE_ENV = process.env.NODE_ENV || 'development';
const USE_MOCK_FLIGHTS = process.env.USE_MOCK_FLIGHTS === 'true';
const USE_MOCK_WEATHER = process.env.USE_MOCK_WEATHER === 'true';
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const OPENROUTESERVICE_API_KEY = process.env.OPENROUTESERVICE_API_KEY;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
const EMISSIONS_API_KEY = process.env.EMISSIONS_API_KEY;

module.exports = {
  PORT,
  MONGODB_URI,
  REDIS_URL,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  NODE_ENV,
  USE_MOCK_FLIGHTS,
  USE_MOCK_WEATHER,
  OPENWEATHERMAP_API_KEY,
  OPENROUTESERVICE_API_KEY,
  NEWSAPI_KEY,
  AVIATIONSTACK_API_KEY,
  EMISSIONS_API_KEY,
};
