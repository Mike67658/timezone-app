type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class MemoryCache {
  private store: Map<string, CacheEntry<any>> = new Map();

  // default TTL = 10 minutes
  set<T>(key: string, data: T, ttlMs: number = 10 * 60 * 1000) {
    this.store.set(key, {
      data,
      timestamp: Date.now() + ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) return null;

    // expired
    if (Date.now() > entry.timestamp) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (Date.now() > entry.timestamp) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

// Global singleton (important for Next.js hot reload)
export const cache = new MemoryCache();

/**
 * Cached fetch helper (VERY important for Open-Meteo)
 */
export async function cachedFetch<T>(
  key: string,
  url: string,
  ttlMs: number = 10 * 60 * 1000
): Promise<T> {
  const existing = cache.get<T>(key);

  if (existing) return existing;

  const res = await fetch(url);
  const data = await res.json();

  cache.set(key, data, ttlMs);

  return data;
}
