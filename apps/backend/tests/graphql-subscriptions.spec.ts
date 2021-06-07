/* eslint-env jest */

import { ApolloClient, StoreObject } from '@apollo/client';
import test from './utils/test-with-sandbox';
import { withAuth, gql } from './utils/call-graphql';
import auth from './utils/auth';
import createWebsocketLink from './utils/graphql-websocket-link';
import createDeciWebsocket from './utils/websocket';

test('graphql subscriptions', () => {
  let client: ApolloClient<StoreObject>;

  it('can create client', async () => {
    client = await createClient();
  });

  it('can subscribe', async () => {
    client = await createClient();
    const result = await new Promise((resolve, reject) => {
      const subscription = client.subscribe({
        query: gql`
          subscription {
            hello
          }
        `,
      });

      subscription.subscribe({
        error: reject,
        next: resolve,
      });
    });

    expect(result).toMatchObject({ data: { hello: 'Hello World!' } });
  }, 15000);
});

async function createClient(userId: string | undefined = undefined): Promise<ApolloClient<StoreObject>> {
  const { token } = await auth(userId);
  const link = createWebsocketLink(createDeciWebsocket(token));
  return withAuth({ token, link });
}
