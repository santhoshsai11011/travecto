const axios = require('axios');
const fetchWithFallback = require('../utils/fetchWithFallback');
const { mockCountryData } = require('../utils/mockData');

const BASE_URL = 'https://restcountries.com/v3.1';
const CACHE_TTL = 86400; // 24 hours

const formatCountryData = (country) => {
  const currencies = country.currencies
    ? Object.entries(country.currencies).map(([code, details]) => ({
        code,
        name: details.name,
        symbol: details.symbol || code,
      }))
    : [];

  const languages = country.languages
    ? Object.values(country.languages)
    : [];

  const callingCode = country.idd?.root
    ? country.idd.root + (country.idd.suffixes?.[0] || '')
    : 'N/A';

  const timezones = country.timezones || [];

  return {
    name: country.name.common,
    officialName: country.name.official,
    capital: country.capital?.[0] || 'N/A',
    region: country.region,
    subregion: country.subregion || 'N/A',
    population: country.population,
    languages,
    currencies,
    flag: country.flag,
    flagUrl: country.flags?.png || country.flags?.svg || '',
    timezone: timezones[0] || 'N/A',
    allTimezones: timezones,
    callingCode,
    tld: country.tld?.[0] || 'N/A',
    independent: country.independent || false,
    unMember: country.unMember || false,
    emergencyNumbers: {
      police: '999',
      ambulance: '999',
      fire: '999',
      note: 'Verify local emergency numbers before travel',
    },
    isMock: false,
  };
};

const getCountryByName = async (countryName) => {
  const cacheKey = `country:${countryName.toLowerCase().trim()}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      const response = await axios.get(
        `${BASE_URL}/name/${encodeURIComponent(countryName)}`,
        { params: { fullText: true } }
      );
      return formatCountryData(response.data[0]);
    },
    () => mockCountryData(countryName)
  );
};

const getCountryByCode = async (code) => {
  const cacheKey = `country:code:${code.toLowerCase().trim()}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      const response = await axios.get(`${BASE_URL}/alpha/${code}`);
      return formatCountryData(response.data[0]);
    },
    () => mockCountryData(code)
  );
};

module.exports = { getCountryByName, getCountryByCode };
