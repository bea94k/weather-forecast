type CacheEntry<TValue> = {
  data: TValue;
  expiresAt: number;
};

interface AsyncTtlRequestCacheOptions {
  ttlMs: number;
  now?: () => number;
}

export interface AsyncTtlRequestCache<TValue> {
  getOrCreate: (cacheKey: string, load: () => Promise<TValue>) => Promise<TValue>;
  clear: () => void;
}

export function createAsyncTtlRequestCache<TValue>(
  options: AsyncTtlRequestCacheOptions
): AsyncTtlRequestCache<TValue> {
  const { ttlMs, now } = options;
  const resolvedCache = new Map<string, CacheEntry<TValue>>();
  const inFlightRequests = new Map<string, Promise<TValue>>();
  const getNow = now ?? (() => Date.now()); // for safety and stability in tests

  async function getOrCreate(cacheKey: string, load: () => Promise<TValue>): Promise<TValue> {
    const cached = resolvedCache.get(cacheKey);

    if (cached) {
      if (cached.expiresAt > getNow()) {
        return cached.data;
      }
      // cache exists, but expired - delete and go on with fetching
      resolvedCache.delete(cacheKey);
    }

    // deduplicate - if identical req already ongoing
    const inFlightRequest = inFlightRequests.get(cacheKey);
    if (inFlightRequest) {
      return inFlightRequest;
    }

    const requestPromise = (async (): Promise<TValue> => {
      const data = await load();
      resolvedCache.set(cacheKey, {
        data,
        expiresAt: getNow() + ttlMs
      });
      return data;
    })();

    inFlightRequests.set(cacheKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  }

  function clear(): void {
    resolvedCache.clear();
    inFlightRequests.clear();
  }

  return {
    getOrCreate,
    clear
  };
}
