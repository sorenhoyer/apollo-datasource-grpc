import { InMemoryLRUCache, KeyValueCache } from 'apollo-server-caching';

class GRPCCache {
  public keyValueCache: KeyValueCache<string>;

  constructor(keyValueCache: KeyValueCache<string>) {
    this.keyValueCache = keyValueCache;
    if (!this.keyValueCache) this.keyValueCache = new InMemoryLRUCache();
  }

  async get(key: string) {
    const entry = await this.keyValueCache.get(`grpccache:${key}`);

    if (entry) return JSON.parse(entry);

    return null;
  }

  async set(key: string, value: any, ttl: number) {
    if (ttl > 0) {
      await this.keyValueCache.set(`grpccache:${key}`, JSON.stringify(value), { ttl });
    }
  }
}

export default GRPCCache;
