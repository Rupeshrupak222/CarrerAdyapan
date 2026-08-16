/**
 * In-Memory and SessionStorage Stale-While-Revalidate (SWR) Cache Service
 * Accelerates UI rendering by returning cached data instantly while refetching in background.
 */

interface CacheEntry<T = any> {
  data: T;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 2 * 60 * 1000; // 2 minutes default TTL

export const cacheService = {
  get: <T = any>(key: string): T | null => {
    try {
      if (memoryCache.has(key)) {
        const item = memoryCache.get(key)!;
        if (Date.now() < item.expiry) {
          return item.data as T;
        }
        memoryCache.delete(key);
      }

      const sessionData = sessionStorage.getItem(`cache_${key}`);
      if (sessionData) {
        const parsed: CacheEntry<T> = JSON.parse(sessionData);
        if (Date.now() < parsed.expiry) {
          memoryCache.set(key, parsed);
          return parsed.data;
        }
        sessionStorage.removeItem(`cache_${key}`);
      }
    } catch (e) {
      console.warn('Cache get error:', e);
    }
    return null;
  },

  set: <T = any>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void => {
    try {
      const cacheObj: CacheEntry<T> = {
        data,
        expiry: Date.now() + ttlMs,
      };
      memoryCache.set(key, cacheObj);
      sessionStorage.setItem(`cache_${key}`, JSON.stringify(cacheObj));
    } catch (e) {
      console.warn('Cache set error:', e);
    }
  },

  invalidate: (key?: string): void => {
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
