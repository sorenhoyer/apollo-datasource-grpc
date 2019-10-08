import { CacheHint } from 'apollo-cache-control';
import 'graphql';

declare module 'graphql/type/definition' {
  interface GraphQLResolveInfo {
    cacheControl: {
      setCacheHint: (hint: CacheHint) => void;
      cacheHint: CacheHint;
    };
  }
}