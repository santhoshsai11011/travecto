const redis = require('../config/redis');

/**
 * Fetch data with multi-layer fallback
 * @param {string} cacheKey - Redis key
 * @param {number} ttl - Cache TTL in seconds
 * @param {Function} apiFn - API call function
 * @param {Function} mockFn - Mock data function (optional)
 * @param {boolean} forceRefresh - Skip cache and force API call
 * @returns {Promise<{data: any, source: string}>}
 */
async function fetchWithFallback(cacheKey, ttl, apiFn, mockFn = null, forceRefresh = false) {

  // 1. Try fresh cache (skip if forceRefresh)
  if (!forceRefresh) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          return { data: parsed, source: 'cache' };
        } catch (parseError) {
          console.error(`Cache parse error for ${cacheKey}:`, parseError.message);
          // Treat as cache miss, continue to API
        }
      }
    } catch (redisError) {
      console.error(`Redis error for ${cacheKey}:`, redisError.message);
      // Continue to API if Redis fails
    }
  }

  // 2. Try API
  try {
    const data = await apiFn();

    // Store in cache
    try {
      await redis.setex(cacheKey, ttl, JSON.stringify(data));
      // Also store as stale backup with longer TTL (3x normal TTL)
      await redis.setex(`stale:${cacheKey}`, ttl * 3, JSON.stringify(data));
    } catch (cacheError) {
      console.error(`Cache store error for ${cacheKey}:`, cacheError.message);
      // Continue even if caching fails
    }

    return { data, source: 'api' };

  } catch (apiError) {
    console.error(`API call failed for ${cacheKey}:`, apiError.message);

    // 3. Try stale cache as fallback
    try {
      const stale = await redis.get(`stale:${cacheKey}`);
      if (stale) {
        try {
          const parsed = JSON.parse(stale);
          console.warn(`Serving stale cache for ${cacheKey}`);
          return { data: parsed, source: 'stale-cache' };
        } catch (parseError) {
          console.error(`Stale cache parse error for ${cacheKey}:`, parseError.message);
        }
      }
    } catch (redisError) {
      console.error(`Redis stale fetch error for ${cacheKey}:`, redisError.message);
    }

    // 4. Try mock data as last resort
    if (mockFn) {
      console.warn(`Serving mock data for ${cacheKey}`);
      return { data: mockFn(), source: 'mock' };
    }

    // 5. Nothing worked — throw clear error
    throw new Error(`All fallbacks failed for ${cacheKey}: ${apiError.message}`);
  }
}

module.exports = fetchWithFallback;
