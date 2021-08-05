/* eslint-env jest */

import { ApolloClient, StoreObject } from '@apollo/client';
import test from './sandbox';

test('graphql subscriptions', ({
  test: it,
  subscriptionClient: createClient,
  gql,
}) => {
  let client: ApolloClient<StoreObject>;

  beforeAll(async () => {
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
