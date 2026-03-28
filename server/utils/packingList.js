const BEACH_CITIES = [
  'goa', 'mumbai', 'chennai', 'kochi', 'vizag',
  'visakhapatnam', 'pondicherry', 'mangalore',
  'kozhikode', 'calicut', 'puri', 'digha',
  'miami', 'bali', 'phuket', 'maldives', 'dubai'
];

const HILL_CITIES = [
  'shimla', 'manali', 'darjeeling', 'ooty', 'munnar',
  'mussoorie', 'nainital', 'coorg', 'kodaikanal',
  'gangtok', 'leh', 'ladakh', 'dharamshala', 'mcleod ganj'
];

const BUSINESS_CITIES = [
  'mumbai', 'delhi', 'bangalore', 'hyderabad',
  'chennai', 'pune', 'gurgaon', 'noida'
];

function detectDestinationType(cityName) {
  const city = cityName?.toLowerCase() || '';
  return {
    isBeachCity: BEACH_CITIES.some(b => city.includes(b)),
    isHillCity: HILL_CITIES.some(h => city.includes(h)),
    isBusinessCity: BUSINESS_CITIES.some(b => city.includes(b))
  };
}

function analyzeForecast(forecast) {
  const rainyDays = forecast.filter(f =>
    f.description?.toLowerCase().includes('rain') ||
    f.description?.toLowerCase().includes('drizzle') ||
    f.description?.toLowerCase().includes('shower')
  ).length;
  const coldDays = forecast.filter(f => f.low < 15).length;
  const hotDays = forecast.filter(f => f.high > 32).length;
  return {
    rainyDays,
    coldDays,
    hotDays,
    hasRainInForecast: rainyDays > 0,
    majorlyRainy: rainyDays >= 3,
    majorlyCold: coldDays >= 3,
    majorlyHot: hotDays >= 3
  };
}

function generatePackingList(weatherData, tripDuration, mode, destinationCity) {
  tripDuration = tripDuration || 3;
  mode = mode || 'flight';
  destinationCity = destinationCity || '';

  // Detect conditions
  const desc = weatherData?.description?.toLowerCase() || '';
  const forecastDescs = weatherData?.forecast?.map(f =>
    f.description?.toLowerCase()) || [];
  const allDescs = [desc, ...forecastDescs].join(' ');
  const forecastAnalysis = analyzeForecast(weatherData?.forecast || []);
  const destType = detectDestinationType(destinationCity);

  const isRainy = allDescs.includes('rain') ||
                  allDescs.includes('drizzle') ||
                  allDescs.includes('shower') ||
                  forecastAnalysis.hasRainInForecast;

  const isCold = (weatherData?.temperature < 15) ||
                  forecastAnalysis.majorlyCold ||
                  destType.isHillCity;

  const isHot = (weatherData?.temperature > 30) ||
                 forecastAnalysis.majorlyHot;

  const isHumid = weatherData?.humidity > 70;
  const isWindy = weatherData?.windSpeed > 10;
  const isSunny = allDescs.includes('clear') || allDescs.includes('sunny');
  const isBeach = destType.isBeachCity;
  const isHill = destType.isHillCity;
  const isBusiness = destType.isBusinessCity;

  // Weather summary
  const weatherContext = [];
  if (forecastAnalysis.rainyDays > 0) {
    weatherContext.push(`Rain expected on ${forecastAnalysis.rainyDays} day(s)`);
  }
  if (isCold) weatherContext.push('Cold temperatures expected');
  if (isHot) weatherContext.push('Hot weather expected');
  if (isHumid) weatherContext.push('High humidity');
  if (isWindy) weatherContext.push('Windy conditions');
  if (isBeach) weatherContext.push('Beach destination');
  if (isHill) weatherContext.push('Hill station');

  // Essentials
  const essentials = [
    'ID proof / Aadhar card',
    'Phone + charger',
    'Wallet + cash',
    'Medicines (personal)',
    'Water bottle',
    'Backpack / day bag'
  ];

  // Clothing
  const clothing = [`${tripDuration} sets of casual clothes`];
  if (isCold) {
    clothing.push('Warm jacket', 'Sweater/hoodie', 'Thermal innerwear', 'Woollen socks', 'Gloves', 'Muffler/scarf');
  }
  if (isHot) {
    clothing.push('Light cotton clothes', 'Sunglasses', 'Hat/cap');
  }
  if (isRainy && forecastAnalysis.rainyDays >= 2) {
    clothing.push('Raincoat', 'Umbrella', 'Waterproof shoes/sandals', 'Extra pair of socks (x2)');
  } else if (isRainy) {
    clothing.push('Compact umbrella');
  }
  if (isHumid) {
    clothing.push('Light breathable fabrics', 'Extra t-shirts (x2)');
  }
  if (isBeach) {
    clothing.push('Swimwear', 'Beach shorts', 'Flip flops', 'Beach towel', 'Sarong/cover-up');
  }
  if (isHill) {
    clothing.push('Trekking shoes', 'Rain poncho', 'Windcheater jacket');
  }
  if (isBusiness) {
    clothing.push('Formal wear (shirt + trousers)', 'Formal shoes', 'Belt');
  }
  clothing.push('Comfortable walking shoes');
  clothing.push(`Undergarments (${tripDuration + 1} pairs)`);
  if (tripDuration > 5) {
    clothing.push('Laundry bag');
  }

  // Toiletries
  const toiletries = [
    'Toothbrush + toothpaste',
    'Shampoo + conditioner',
    'Body soap/wash',
    'Deodorant/antiperspirant'
  ];
  if (isHot || isSunny) {
    toiletries.push('Sunscreen SPF 50+', 'Lip balm with SPF');
  }
  if (isRainy || isHumid) {
    toiletries.push('Moisturizer', 'Anti-fungal powder');
  }
  if (isHill) {
    toiletries.push('Lip balm', 'Moisturizer (cold weather)');
  }
  if (tripDuration > 3) {
    toiletries.push('Razor + shaving cream', 'Hair comb/brush');
  }
  if (tripDuration > 5) {
    toiletries.push('Laundry detergent (small pack)');
  }

  // Electronics
  const electronics = [
    'Phone charger',
    'Power bank (10000mAh+)',
    'Earphones/headphones'
  ];
  if (mode === 'road') {
    electronics.push('Car charger', 'Dashcam (optional)', 'Bluetooth speaker', 'AUX cable');
  }
  if (mode === 'flight') {
    electronics.push('Travel adapter (international)', 'Neck pillow');
  }
  if (tripDuration > 3) {
    electronics.push('Laptop + charger', 'Hard drive/USB');
  }
  electronics.push('Universal travel adapter');

  // Documents
  const documents = [
    'ID proof (original + photocopy)',
    'Emergency contacts list',
    'Hotel/stay booking confirmation',
    'Travel insurance documents'
  ];
  if (mode === 'flight') {
    documents.push('Flight tickets (digital + printed)', 'Passport (if international)');
  }
  if (mode === 'road') {
    documents.push('Driving license', 'Vehicle RC book', 'Car insurance papers', 'PUC certificate');
  }
  if (isBusiness) {
    documents.push('Business cards', 'Work laptop', 'Company ID card');
  }

  // Health & Safety
  const healthSafety = [
    'Hand sanitizer',
    'Face masks (2-3)',
    'Basic first aid kit',
    'Pain relief tablets',
    'Antacid tablets'
  ];
  if (isRainy) {
    healthSafety.push('Anti-fungal cream', 'Waterproof bag covers');
  }
  if (isHot) {
    healthSafety.push('ORS packets', 'Electrolyte drinks', 'Cooling powder');
  }
  if (isHill) {
    healthSafety.push('Altitude sickness tablets', 'Warm compress');
  }
  if (isBeach) {
    healthSafety.push('After-sun lotion', 'Insect repellent');
  }
  if (tripDuration > 3) {
    healthSafety.push('Prescription medicines (extra supply)');
  }

  return {
    tripDuration,
    mode,
    destinationCity,
    destinationType: {
      isBeach,
      isHill,
      isBusiness
    },
    weatherContext: weatherContext.join(' | ') || 'Moderate weather expected',
    forecastAnalysis,
    categories: {
      essentials,
      clothing,
      toiletries,
      electronics,
      documents,
      healthSafety
    },
    totalItems: essentials.length + clothing.length +
                toiletries.length + electronics.length +
                documents.length + healthSafety.length,
    generatedAt: new Date().toISOString()
  };
}

module.exports = { generatePackingList, detectDestinationType, analyzeForecast };
