const cron = require('node-cron');
const { getWeatherByCity } = require('../services/weatherService');
const { getExchangeRate } = require('../services/currencyService');
const { getCountryByName } = require('../services/countryService');
const ApiMetrics = require('../models/ApiMetrics');
const redis = require('../config/redis');

const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Jaipur'
];

const POPULAR_CURRENCY_PAIRS = [
  { from: 'INR', to: 'USD' },
  { from: 'INR', to: 'EUR' },
  { from: 'INR', to: 'GBP' },
  { from: 'INR', to: 'JPY' },
  { from: 'INR', to: 'SGD' }
];

const POPULAR_COUNTRIES = [
  'India',
  'United States',
  'United Arab Emirates',
  'Singapore',
  'United Kingdom'
];

async function warmWeatherCache() {
  console.log('🌦️ Warming weather cache...');
  for (const city of POPULAR_CITIES) {
    try {
      await getWeatherByCity(city);
      console.log(`✅ Weather cached: ${city}`);
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`❌ Weather warm failed for ${city}:`, err.message);
    }
  }
}

async function warmCurrencyCache() {
  console.log('💱 Warming currency cache...');
  for (const pair of POPULAR_CURRENCY_PAIRS) {
    try {
      await getExchangeRate(pair.from, pair.to);
      console.log(`✅ Currency cached: ${pair.from}→${pair.to}`);
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`❌ Currency warm failed:`, err.message);
    }
  }
}

async function warmCountryCache() {
  console.log('🌍 Warming country cache...');
  for (const country of POPULAR_COUNTRIES) {
    try {
      await getCountryByName(country);
      console.log(`✅ Country cached: ${country}`);
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`❌ Country warm failed for ${country}:`, err.message);
    }
  }
}

// Job 1: Cache Warming — every 30 mins
cron.schedule('*/30 * * * *', async () => {
  console.log('🔥 Starting cache warming...');
  await warmWeatherCache();
  await warmCurrencyCache();
  console.log('✅ Cache warming complete');
}, { scheduled: true, timezone: 'Asia/Kolkata' });

// Job 2: Currency Refresh — every hour
cron.schedule('0 * * * *', async () => {
  console.log('💱 Refreshing currency rates...');
  for (const pair of POPULAR_CURRENCY_PAIRS) {
    try {
      await redis.del(`currency:${pair.from}:${pair.to}`);
      await redis.del(`stale:currency:${pair.from}:${pair.to}`);
      await getExchangeRate(pair.from, pair.to);
      console.log(`✅ Currency refreshed: ${pair.from}→${pair.to}`);
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`❌ Currency refresh failed:`, err.message);
    }
  }
  console.log('✅ Currency refresh complete');
}, { scheduled: true, timezone: 'Asia/Kolkata' });

// Job 3: Country Refresh — midnight daily
cron.schedule('0 0 * * *', async () => {
  console.log('🌍 Refreshing country data...');
  for (const country of POPULAR_COUNTRIES) {
    try {
      await redis.del(`country:${country.toLowerCase()}`);
      await redis.del(`stale:country:${country.toLowerCase()}`);
      await getCountryByName(country);
      console.log(`✅ Country refreshed: ${country}`);
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`❌ Country refresh failed:`, err.message);
    }
  }
  console.log('✅ Country refresh complete');
}, { scheduled: true, timezone: 'Asia/Kolkata' });

// Job 4: API Quota Check — 9am daily
cron.schedule('0 9 * * *', async () => {
  console.log('📊 Checking API quotas...');
  try {
    const metrics = await ApiMetrics.find({});

    for (const metric of metrics) {
      const total = metric.cacheHits + metric.cacheMisses;
      const hitRate = total > 0
        ? ((metric.cacheHits / total) * 100).toFixed(1)
        : 0;

      console.log(`
        📈 ${metric.service}
        🎯 Hit Rate: ${hitRate}%
        ✅ Hits: ${metric.cacheHits}
        ❌ Misses: ${metric.cacheMisses}
        ⏰ Last Success: ${metric.lastSuccess}
      `);

      if (metric.remainingCalls < 20) {
        console.warn(`⚠️ WARNING: ${metric.service} only has ${metric.remainingCalls} calls left!`);
      }

      // Persist updated quota check timestamp per service
      await ApiMetrics.findOneAndUpdate(
        { service: metric.service },
        { updatedAt: new Date() },
        { upsert: true }
      );
    }

    // Log quota check completion
    await ApiMetrics.findOneAndUpdate(
      { service: 'quota-check' },
      { lastSuccess: new Date(), updatedAt: new Date() },
      { upsert: true }
    );

  } catch (err) {
    console.error('❌ Quota check failed:', err.message);
  }

  console.log('✅ Quota check complete');
}, { scheduled: true, timezone: 'Asia/Kolkata' });

// Job 5: Redis Memory Check — every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('🔴 Checking Redis memory...');
  try {
    const info = await redis.info('memory');
    const usedMemory = info.match(/used_memory_human:(.+)/)?.[1]?.trim();
    const maxMemory = info.match(/maxmemory_human:(.+)/)?.[1]?.trim();
    const usedPercent = info.match(/used_memory_rss:(\d+)/)?.[1];

    console.log(`Redis — Used: ${usedMemory}, Max: ${maxMemory}`);

    // Persist Redis stats to ApiMetrics for dashboard
    await ApiMetrics.findOneAndUpdate(
      { service: 'redis' },
      {
        lastSuccess: new Date(),
        updatedAt: new Date(),
        remainingCalls: parseInt(usedPercent) || 0
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('❌ Redis check failed:', err.message);
  }
}, { scheduled: true, timezone: 'Asia/Kolkata' });

// Initial cache warmup on server startup
async function runInitialWarmup() {
  console.log('🔥 Running initial cache warmup on startup...');
  try {
    await warmWeatherCache();
    await warmCurrencyCache();
    await warmCountryCache();
    console.log('✅ Initial cache warmup complete');
  } catch (err) {
    console.error('❌ Initial warmup failed:', err.message);
  }
}

// Run warmup after short delay to let server fully start
setTimeout(runInitialWarmup, 5000);

console.log('⏰ Cron jobs scheduled:');
console.log('  - Cache warming: every 30 mins');
console.log('  - Currency refresh: every hour');
console.log('  - Country refresh: midnight daily');
console.log('  - API quota check: 9am daily');
console.log('  - Redis memory check: every 6 hours');

module.exports = { runInitialWarmup };
