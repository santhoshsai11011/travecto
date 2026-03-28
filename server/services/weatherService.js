const axios = require('axios');
const fetchWithFallback = require('../utils/fetchWithFallback');
const { mockWeatherData } = require('../utils/mockData');
const { OPENWEATHERMAP_API_KEY, USE_MOCK_WEATHER } = require('../config/env');

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const CACHE_TTL = 7200; // 2 hours

const fillForecastTo7Days = (dailyForecast) => {
  const fillDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  while (dailyForecast.length < 7) {
    const lastForecast = dailyForecast[dailyForecast.length - 1];
    dailyForecast.push({
      ...lastForecast,
      day: fillDays[dailyForecast.length - 1] || `Day ${dailyForecast.length + 1}`,
      isEstimate: true,
    });
  }
  return dailyForecast;
};

const processForecastList = (forecastList) => {
  const dailyForecast = [];
  const seenDays = new Set();

  for (const item of forecastList) {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split('T')[0];
    const hour = date.getUTCHours();

    if (!seenDays.has(dayKey) && hour >= 10 && hour <= 14) {
      seenDays.add(dayKey);

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      dailyForecast.push({
        day: dayKey === today ? 'Today' :
             dayKey === tomorrow ? 'Tomorrow' :
             date.toLocaleDateString('en-US', { weekday: 'long' }),
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind?.speed || 0,
        isEstimate: false,
      });
    }
  }

  return fillForecastTo7Days(dailyForecast);
};

const getWeatherByCity = async (city) => {
  if (USE_MOCK_WEATHER) {
    return { data: mockWeatherData(city), source: 'mock' };
  }

  const cacheKey = `weather:${city.toLowerCase().trim()}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`${BASE_URL}/weather`, {
          params: {
            q: city,
            appid: OPENWEATHERMAP_API_KEY,
            units: 'metric',
          },
        }),
        axios.get(`${BASE_URL}/forecast`, {
          params: {
            q: city,
            appid: OPENWEATHERMAP_API_KEY,
            units: 'metric',
            cnt: 40,
          },
        }),
      ]);

      const current = currentRes.data;
      const forecast = forecastRes.data;

      return {
        city: current.name,
        country: current.sys.country,
        temperature: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        windSpeed: current.wind.speed,
        windDirection: current.wind.deg || 0,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        forecast: processForecastList(forecast.list),
        isMock: false,
      };
    },
    () => mockWeatherData(city)
  );
};

const getWeatherByCoords = async (lat, lon) => {
  const cacheKey = `weather:${lat}:${lon}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`${BASE_URL}/weather`, {
          params: { lat, lon, appid: OPENWEATHERMAP_API_KEY, units: 'metric' },
        }),
        axios.get(`${BASE_URL}/forecast`, {
          params: { lat, lon, appid: OPENWEATHERMAP_API_KEY, units: 'metric', cnt: 40 },
        }),
      ]);

      const current = currentRes.data;
      const forecast = forecastRes.data;

      return {
        city: current.name,
        country: current.sys.country,
        temperature: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        windSpeed: current.wind.speed,
        windDirection: current.wind.deg || 0,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        forecast: processForecastList(forecast.list),
        isMock: false,
      };
    },
    () => mockWeatherData('Unknown City')
  );
};

module.exports = { getWeatherByCity, getWeatherByCoords };
