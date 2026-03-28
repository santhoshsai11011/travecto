const mockWeatherData = (city) => {
  return {
    city: city,
    country: 'IN',
    temperature: 28,
    feelsLike: 30,
    humidity: 65,
    windSpeed: 12,
    description: 'Partly cloudy',
    icon: '02d',
    forecast: [
      { day: 'Today', high: 32, low: 24, description: 'Sunny', icon: '01d' },
      { day: 'Tomorrow', high: 30, low: 23, description: 'Partly cloudy', icon: '02d' },
      { day: 'Day 3', high: 28, low: 22, description: 'Light rain', icon: '10d' },
      { day: 'Day 4', high: 27, low: 21, description: 'Cloudy', icon: '04d' },
      { day: 'Day 5', high: 29, low: 23, description: 'Sunny', icon: '01d' },
      { day: 'Day 6', high: 31, low: 24, description: 'Sunny', icon: '01d' },
      { day: 'Day 7', high: 30, low: 23, description: 'Partly cloudy', icon: '02d' },
    ],
    isMock: true,
  };
};

const mockCountryData = (countryName) => {
  const countryDefaults = {
    USA: {
      capital: 'Washington D.C.',
      region: 'Americas',
      population: 331000000,
      languages: ['English'],
      currencies: [{ name: 'US Dollar', symbol: '$', code: 'USD' }],
      flag: '\u{1F1FA}\u{1F1F8}',
      flagUrl: 'https://flagcdn.com/w320/us.png',
      timezone: 'UTC-5:00',
      callingCode: '+1',
      emergencyNumbers: { police: '911', ambulance: '911', fire: '911' },
    },
    UAE: {
      capital: 'Abu Dhabi',
      region: 'Asia',
      population: 9900000,
      languages: ['Arabic', 'English'],
      currencies: [{ name: 'UAE Dirham', symbol: '\u062F.\u0625', code: 'AED' }],
      flag: '\u{1F1E6}\u{1F1EA}',
      flagUrl: 'https://flagcdn.com/w320/ae.png',
      timezone: 'UTC+4:00',
      callingCode: '+971',
      emergencyNumbers: { police: '999', ambulance: '998', fire: '997' },
    },
    UK: {
      capital: 'London',
      region: 'Europe',
      population: 67000000,
      languages: ['English'],
      currencies: [{ name: 'British Pound', symbol: '£', code: 'GBP' }],
      flag: '\u{1F1EC}\u{1F1E7}',
      flagUrl: 'https://flagcdn.com/w320/gb.png',
      timezone: 'UTC+0:00',
      callingCode: '+44',
      emergencyNumbers: { police: '999', ambulance: '999', fire: '999' },
    },
    INDIA: {
      capital: 'New Delhi',
      region: 'Asia',
      population: 1400000000,
      languages: ['Hindi', 'English'],
      currencies: [{ name: 'Indian Rupee', symbol: '₹', code: 'INR' }],
      flag: '\u{1F1EE}\u{1F1F3}',
      flagUrl: 'https://flagcdn.com/w320/in.png',
      timezone: 'UTC+5:30',
      callingCode: '+91',
      emergencyNumbers: { police: '100', ambulance: '108', fire: '101' },
    },
    SINGAPORE: {
      capital: 'Singapore',
      region: 'Asia',
      population: 5900000,
      languages: ['English', 'Mandarin', 'Malay'],
      currencies: [{ name: 'Singapore Dollar', symbol: 'S$', code: 'SGD' }],
      flag: '\u{1F1F8}\u{1F1EC}',
      flagUrl: 'https://flagcdn.com/w320/sg.png',
      timezone: 'UTC+8:00',
      callingCode: '+65',
      emergencyNumbers: { police: '999', ambulance: '995', fire: '995' },
    },
  };

  const data = countryDefaults[countryName.toUpperCase()] || countryDefaults['INDIA'];

  return { ...data, isMock: true };
};

const mockCurrencyData = (from, to) => {
  const ratesFromINR = {
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    AED: 0.044,
    SGD: 0.016,
    JPY: 1.78,
    AUD: 0.018,
    CAD: 0.016,
    INR: 1,
  };

  let rate;
  if (from === 'INR') {
    rate = ratesFromINR[to] || 1;
  } else if (to === 'INR') {
    rate = 1 / (ratesFromINR[from] || 1);
  } else {
    rate = (1 / (ratesFromINR[from] || 1)) * (ratesFromINR[to] || 1);
  }

  const converted = parseFloat((10000 * rate).toFixed(2));

  return {
    from,
    to,
    rate: parseFloat(rate.toFixed(6)),
    amount: 10000,
    converted,
    lastUpdated: new Date().toISOString(),
    isMock: true,
  };
};

const calculateArrival = (departure, duration) => {
  const [depH, depM] = departure.split(':').map(Number);
  const hoursMatch = duration.match(/(\d+)h/);
  const minsMatch = duration.match(/(\d+)m/);
  const durH = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const durM = minsMatch ? parseInt(minsMatch[1]) : 0;

  let arrH = depH + durH;
  let arrM = depM + durM;
  if (arrM >= 60) {
    arrH += Math.floor(arrM / 60);
    arrM = arrM % 60;
  }
  arrH = arrH % 24;

  return `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;
};

const mockFlightData = (source, destination) => {
  const routeDistances = {
    'hyderabad-mumbai': 620,
    'hyderabad-delhi': 1250,
    'hyderabad-bangalore': 500,
    'mumbai-delhi': 1140,
    'mumbai-bangalore': 845,
    'delhi-bangalore': 1740,
    default: 1000,
  };

  const key = `${source.toLowerCase()}-${destination.toLowerCase()}`;
  const reverseKey = `${destination.toLowerCase()}-${source.toLowerCase()}`;
  const distance = routeDistances[key] || routeDistances[reverseKey] || routeDistances['default'];

  const hours = Math.floor(distance / 800) + 1;
  const minutes = Math.floor(((distance % 800) / 800) * 60);
  const duration = `${hours}h ${minutes > 0 ? minutes + 'm' : '00m'}`;

  return {
    source,
    destination,
    flights: [
      {
        flightNumber: 'AI 501',
        airline: 'Air India',
        departure: '06:00',
        arrival: calculateArrival('06:00', duration),
        duration,
        status: 'Scheduled',
        terminal: 'T2',
      },
      {
        flightNumber: '6E 234',
        airline: 'IndiGo',
        departure: '09:30',
        arrival: calculateArrival('09:30', duration),
        duration,
        status: 'Scheduled',
        terminal: 'T1',
      },
      {
        flightNumber: 'SG 101',
        airline: 'SpiceJet',
        departure: '14:00',
        arrival: calculateArrival('14:00', duration),
        duration,
        status: 'Scheduled',
        terminal: 'T1',
      },
    ],
    isMock: true,
  };
};

const mockNewsData = (city) => {
  return {
    city,
    articles: [
      {
        title: `Latest updates from ${city}`,
        description: 'Stay informed about recent developments in the area.',
        url: 'https://example.com',
        source: 'Mock News',
        publishedAt: new Date().toISOString(),
      },
      {
        title: `Travel advisory for ${city}`,
        description: 'Check current travel conditions before your trip.',
        url: 'https://example.com',
        source: 'Mock News',
        publishedAt: new Date().toISOString(),
      },
      {
        title: `Weather patterns affecting ${city}`,
        description: 'Meteorologists report seasonal weather changes.',
        url: 'https://example.com',
        source: 'Mock News',
        publishedAt: new Date().toISOString(),
      },
    ],
    isMock: true,
  };
};

const mockCarbonData = (mode, distance) => {
  const emissionFactors = {
    flight: 0.255,
    car: 0.133,
    bus: 0.089,
    train: 0.041,
  };

  const co2kg = parseFloat(((emissionFactors[mode] || 0.133) * distance).toFixed(2));

  const greenerAlternatives = Object.entries(emissionFactors)
    .filter(([m]) => m !== mode)
    .sort((a, b) => a[1] - b[1]);

  const greenest = greenerAlternatives[0];

  return {
    mode,
    distance,
    co2kg,
    comparison: Object.entries(emissionFactors).map(([m, factor]) => ({
      mode: m,
      co2kg: parseFloat((factor * distance).toFixed(2)),
      isSelected: m === mode,
    })),
    greenerAlternative: greenest ? greenest[0] : mode,
    savingsKg: parseFloat((((emissionFactors[mode] || 0.133) - 0.041) * distance).toFixed(2)),
    isMock: true,
  };
};

module.exports = {
  mockWeatherData,
  mockCountryData,
  mockCurrencyData,
  mockFlightData,
  mockNewsData,
  mockCarbonData,
};
