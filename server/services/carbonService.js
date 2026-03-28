const axios = require('axios');
const fetchWithFallback = require('../utils/fetchWithFallback');
const { mockCarbonData } = require('../utils/mockData');

const BASE_URL = 'https://api.emissions.dev/v1';
const CACHE_TTL = 21600; // 6 hours

// kg CO2 per km
const EMISSION_FACTORS = {
  flight: 0.255,
  car: 0.133,
  bus: 0.089,
  train: 0.041
};

function findGreenerAlternative(currentMode, distanceKm) {
  const alternatives = Object.entries(EMISSION_FACTORS).filter(([m]) => m !== currentMode);
  const [greenestMode, greenestFactor] = alternatives.reduce((a, b) => a[1] < b[1] ? a : b);

  const currentEmission = EMISSION_FACTORS[currentMode] * distanceKm;
  const greenEmission = greenestFactor * distanceKm;
  const savingsKg = parseFloat((currentEmission - greenEmission).toFixed(2));

  return {
    mode: greenestMode,
    co2kg: parseFloat(greenEmission.toFixed(2)),
    savingsKg,
    savingsPercent: parseFloat(((savingsKg / currentEmission) * 100).toFixed(1))
  };
}

function getTransportLabel(mode) {
  switch (mode) {
    case 'flight': return '✈️ Flight';
    case 'car': return '🚗 Car';
    case 'bus': return '🚌 Bus';
    case 'train': return '🚆 Train';
    default: return mode;
  }
}

function generateEcoTip(currentMode, distanceKm, greenerAlt) {
  if (currentMode === 'train') {
    return '🌟 Great choice! Train is the most eco-friendly option.';
  }
  if (currentMode === 'flight') {
    if (distanceKm < 500) {
      return `✈️ For ${distanceKm}km, train would be faster AND save ${greenerAlt.savingsKg}kg CO₂!`;
    }
    if (distanceKm < 1500) {
      return `🚆 A train journey would save ${greenerAlt.savingsPercent}% carbon on this route.`;
    }
    return `🌍 Long haul flight — consider carbon offsetting to neutralize ${greenerAlt.savingsKg}kg CO₂.`;
  }
  if (currentMode === 'car') {
    if (distanceKm < 300) {
      return `🚌 Bus is 33% cheaper AND saves ${greenerAlt.savingsKg}kg CO₂ on this short trip!`;
    }
    return `👥 Carpooling this route saves ${greenerAlt.savingsKg}kg CO₂ per empty seat!`;
  }
  if (currentMode === 'bus') {
    return `🚆 Train is slightly greener and saves ${greenerAlt.savingsKg}kg CO₂ on this route.`;
  }
  return `Consider ${greenerAlt.mode} to save ${greenerAlt.savingsKg}kg CO₂.`;
}

const getCarbonFootprint = async (mode, distanceKm) => {
  if (!EMISSION_FACTORS[mode]) {
    mode = 'car'; // default to car
  }

  const cacheKey = `carbon:${mode}:${distanceKm}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      const response = await axios.get(`${BASE_URL}/travel`, {
        params: {
          activity: distanceKm,
          activityType: 'km',
          mode: mode,
          country: 'in'
        }
      });

      if (!response.data) {
        throw new Error('No carbon data received');
      }

      const co2kg = parseFloat((response.data.co2e_kg ||
        (EMISSION_FACTORS[mode] * distanceKm)).toFixed(2));

      const comparison = Object.entries(EMISSION_FACTORS).map(([m, factor]) => ({
        mode: m,
        co2kg: parseFloat((factor * distanceKm).toFixed(2)),
        isSelected: m === mode,
        label: getTransportLabel(m)
      }));

      const greenerAlternative = findGreenerAlternative(mode, distanceKm);

      return {
        mode,
        distanceKm,
        co2kg,
        comparison,
        greenerAlternative,
        tip: generateEcoTip(mode, distanceKm, greenerAlternative),
        isMock: false
      };
    },
    () => mockCarbonData(mode, distanceKm)
  );
};

const getComparisonForDistance = async (distanceKm) => {
  const cacheKey = `carbon:comparison:${distanceKm}`;

  return fetchWithFallback(
    cacheKey,
    CACHE_TTL,
    async () => {
      const comparison = Object.entries(EMISSION_FACTORS).map(([mode, factor]) => ({
        mode,
        label: getTransportLabel(mode),
        co2kg: parseFloat((factor * distanceKm).toFixed(2)),
        costINR: mode === 'flight' ? Math.round(distanceKm * 5) :
                 mode === 'car' ? Math.round(distanceKm * 6.87) :
                 mode === 'bus' ? Math.round(distanceKm * 1.5) :
                 Math.round(distanceKm * 2)
      }));

      return {
        distanceKm,
        comparison,
        greenest: comparison.reduce((a, b) => a.co2kg < b.co2kg ? a : b),
        isMock: false
      };
    },
    () => mockCarbonData('car', distanceKm)
  );
};

module.exports = { getCarbonFootprint, getComparisonForDistance };
