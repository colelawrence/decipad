import { ApolloClient, StoreObject } from '@apollo/client';
import createDeciWebsocket from './websocket';
import createWebsocketLink from './graphql-websocket-link';
import auth from './auth';
import graphql from './call-graphql';
import { Config } from './config';

export default (config: Config) => {
  return async function createClient(
    userId: string | undefined = undefined
  ): Promise<ApolloClient<StoreObject>> {
    const { token } = await auth(config)(userId);
    const link = createWebsocketLink(config)(createDeciWebsocket(token));
    return graphql(config).withAuth({ token, link });
  };
};
