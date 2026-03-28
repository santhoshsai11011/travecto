const redis = require('../config/redis');

async function clearCache() {
  await redis.del('country:india');
  await redis.del('stale:country:india');
  console.log('Cache cleared!');
  process.exit(0);
}

clearCache();
