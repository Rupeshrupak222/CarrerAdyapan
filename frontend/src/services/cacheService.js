/**
 * In-Memory and SessionStorage Stale-While-Revalidate (SWR) Cache Service
 * Accelerates UI rendering by returning cached data instantly while refetching in background.
 */

const memoryCache = new Map();
const DEFAULT_TTL_MS = 2 * 60 * 1000; // 2 minutes default TTL

export const cacheService = {
  /**
   * Get item from cache if valid
   */
  get: (key) => {
    try {
      // 1. Check in-memory cache first (fastest)
      if (memoryCache.has(key)) {
        const item = memoryCache.get(key);
        if (Date.now() < item.expiry) {
          return item.data;
        }
        memoryCache.delete(key);
      }

      // 2. Fallback to sessionStorage
      const sessionData = sessionStorage.getItem(`cache_${key}`);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (Date.now() < parsed.expiry) {
          memoryCache.set(key, parsed); // populate memory cache
          return parsed.data;
        }
        sessionStorage.removeItem(`cache_${key}`);
      }
    } catch (e) {
      console.warn('Cache get error:', e);
    }
    return null;
  },

  /**
   * Set item in cache with TTL
   */
  set: (key, data, ttlMs = DEFAULT_TTL_MS) => {
    try {
      const cacheObj = {
        data,
        expiry: Date.now() + ttlMs,
      };
      memoryCache.set(key, cacheObj);
      sessionStorage.setItem(`cache_${key}`, JSON.stringify(cacheObj));
    } catch (e) {
      console.warn('Cache set error:', e);
    }
  },

  /**
   * Clear specific key or whole cache
   */
  invalidate: (key) => {
    try {
      if (key) {
        memoryCache.delete(key);
        sessionStorage.removeItem(`cache_${key}`);
      } else {
        memoryCache.clear();
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('Cache invalidate error:', e);
    }
  },
};
