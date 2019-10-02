# apollo-datasource-grpc
gRPC implementation of Apollo Server's Datasources. Makes it possible to use Partial Query Caching

## Usage

To get started, install the apollo-datasource-grpc package:

```
npm i apollo-datasource-grpc
```
To define a data source, extend the GRPCDataSource class 

```ts
import GRPCDataSource from 'apollo-datasource-grpc';
import * as grpc from 'grpc';
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition: any = protoLoader.loadSync(__dirname + '/movies.proto');
const proto: any = grpc.loadPackageDefinition(packageDefinition).Movies;
const client = new proto.Assets(process.env.MOVIES_DATASOURCE_URL, grpc.credentials.createInsecure());

class MoviesAPI extends GRPCDataSource {
  constructor() {
    super();
    this.client = client;
  }

  async getMovie(id: string) {
    const meta = new grpc.Metadata();
    meta.add('userId', this.context.currentUser.id);

    return this.callRPC(0, { args: { id }, meta, rpcName: 'GetMovie' });
  }

  async getMostViewedMovies() {
    const meta = new grpc.Metadata();
    meta.add('userId', this.context.currentUser.id);

    return (await this.callRPC(0, { args: {}, meta, rpcName: 'GetMovies' }) as any).movies;
  }
}

export default MoviesAPI;
```

It's also possible to user DataLoader for batch requests
