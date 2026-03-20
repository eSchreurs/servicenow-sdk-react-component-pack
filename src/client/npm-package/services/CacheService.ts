// CacheService — shared in-memory cache for the browser session.
// All services that need caching go through here — no service maintains its own Map.

const store = new Map<string, unknown>();

export function has(key: string): boolean {
  return store.has(key);
}

export function get<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function set<T>(key: string, value: T): void {
  store.set(key, value);
}

export function del(key: string): void {
  store.delete(key);
}

// Removes all entries whose key starts with the given prefix.
export function invalidate(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

export function clear(): void {
  store.clear();
}

// Convenience wrapper: returns cached value if present, otherwise calls fetcher,
// caches the result, and returns it. Failed fetches are never cached.
export async function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (store.has(key)) {
    return store.get(key) as T;
  }
  const value = await fetcher();
  store.set(key, value);
  return value;
}
