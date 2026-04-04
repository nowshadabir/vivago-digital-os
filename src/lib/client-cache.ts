type CacheEntry<T> = {
  timestamp: number;
  promise: Promise<T>;
};

const responseCache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 30_000;

export async function cachedJson<T>(url: string, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const cached = responseCache.get(url) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.promise;
  }

  const promise = fetch(url, { cache: "no-store", credentials: "include" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Request failed for ${url}`);
      }

      return (await response.json()) as T;
    })
    .catch((error: unknown) => {
      responseCache.delete(url);
      throw error;
    });

  responseCache.set(url, { timestamp: now, promise });
  return promise;
}

export function invalidateCachedJson(urlPrefix: string) {
  for (const key of responseCache.keys()) {
    if (key.startsWith(urlPrefix)) {
      responseCache.delete(key);
    }
  }
}
