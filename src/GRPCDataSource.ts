import { DataSource, DataSourceConfig } from 'apollo-datasource';
import crypto from 'crypto';
import GRPCCache from './GRPCCache';

abstract class GRPCDataSource<TContext = any> extends DataSource {
  cache!: GRPCCache;
  context!: TContext;
  client: any;

  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<any>): void {
    this.context = config.context;
    this.cache = new GRPCCache(config.cache);
  }

  async callRPC(ttl = 5, request: any, fnTransformResponseData?: any) {
    const cacheKey = this.getCacheKey(request.args, request.rpcName);

    const entry = await this.cache.get(cacheKey);

    if (entry) return entry;

    const response = await new Promise((resolve: any, reject: any) => {
      this.client[request.rpcName]({ ...request.args }, request.meta, (err: any, response: any) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        if (fnTransformResponseData) {
          const res = fnTransformResponseData(response);
          this.cache.set(cacheKey, res, ttl);
          resolve(res);
        } else {
          this.cache.set(cacheKey, response, ttl);
          resolve(response);
        }
      });
    });

    return response;
  }

  getCacheKey(args: any, rpcName: string) {
    return crypto
      .createHash("sha1")
      .update(JSON.stringify(args) + rpcName)
      .digest("base64");
  }
}

export default GRPCDataSource;
