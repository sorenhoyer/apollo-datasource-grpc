import { DataSource, DataSourceConfig } from 'apollo-datasource';
import crypto from 'crypto';
import { GraphQLResolveInfo } from 'graphql';
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

  async callRPC(request: any, info?: GraphQLResolveInfo, fnTransformResponseData?: any) {
    let path;
    let maxAge = 0;
    let scope = 'PUBLIC';

    if (info) {
      path = info.path;

      if (info.cacheControl && info.cacheControl.cacheHint) {
        if (info.cacheControl.cacheHint.maxAge) maxAge = info.cacheControl.cacheHint.maxAge;
        if (info.cacheControl.cacheHint.scope) scope = info.cacheControl.cacheHint.scope;
      }
    }

    const cacheKey = this.generateCacheKey({
      ...request.args,
      ...path,
      rpcName: request.rpcName,
      maxAge,
      scope,
    });

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
          this.cache.set(cacheKey, res, maxAge);
          resolve(res);
        } else {
          this.cache.set(cacheKey, response, maxAge);
          resolve(response);
        }
      });
    });

    return response;
  }

  generateCacheKey(obj: any) {
    return crypto
      .createHash("sha1")
      .update(JSON.stringify(obj))
      .digest("base64");
  }
}

export default GRPCDataSource;
