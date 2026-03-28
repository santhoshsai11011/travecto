const axios = require('axios');
const fetchWithFallback = require('../utils/fetchWithFallback');
const { mockCurrencyData } = require('../utils/mockData');

const BASE_URL = 'https://api.frankfurter.app';
const CACHE_TTL = 3600; // 1 hour

const getExchangeRate = async (from, to) => {
  from = from.toUpperCase();
  to = to.toUpperCase();

  if (from === to) {
    return {
      data: {
        from,
        to,
        rate: 1,
        amount: 10000,
        converted: 10000,
        lastUpdated: new Date().toISOString(),
        isMock: false,
      },
      source: 'computed',
    };
  }

  const cacheKey = `currency:${from}:${to}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      const response = await axios.get(`${BASE_URL}/latest`, {
        params: {
          from,
          to,
        },
      });

      const rate = response.data.rates[to];

      return {
        from,
        to,
        rate: parseFloat(rate.toFixed(6)),
        amount: 10000,
        converted: parseFloat((10000 * rate).toFixed(2)),
        lastUpdated: response.data.date,
        isMock: false,
      };
    },
    () => mockCurrencyData(from, to)
  );
};

const convertAmount = async (from, to, amount) => {
  from = from.toUpperCase();
  to = to.toUpperCase();

  if (from === to) {
    return {
      data: {
        from,
        to,
        rate: 1,
        amount: parseFloat(amount),
        converted: parseFloat(amount),
        lastUpdated: new Date().toISOString(),
        isMock: false,
      },
      source: 'computed',
    };
  }

  // Get rate (cached)
  const rateResult = await getExchangeRate(from, to);
  const rate = rateResult.data.rate;

  // Calculate fresh with requested amount
  return {
    data: {
      from,
      to,
      rate,
      amount: parseFloat(amount),
      converted: parseFloat((amount * rate).toFixed(2)),
      lastUpdated: rateResult.data.lastUpdated,
      isMock: rateResult.data.isMock,
    },
    source: rateResult.source,
  };
};

const getSupportedCurrencies = async () => {
  const cacheKey = 'currencies:supported';

  return fetchWithFallback(
    cacheKey,
    86400,
    async () => {
      const response = await axios.get(`${BASE_URL}/currencies`);
      return {
        currencies: response.data,
        isMock: false,
      };
    },
    () => ({
      currencies: {
        USD: 'United States Dollar',
        EUR: 'Euro',
        GBP: 'British Pound',
        INR: 'Indian Rupee',
        AED: 'UAE Dirham',
        SGD: 'Singapore Dollar',
        JPY: 'Japanese Yen',
        AUD: 'Australian Dollar',
        CAD: 'Canadian Dollar',
      },
      isMock: true,
    })
  );
};

module.exports = { getExchangeRate, convertAmount, getSupportedCurrencies };
