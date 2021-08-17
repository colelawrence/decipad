/* eslint-env jest */

import test from './sandbox';

test('graphql subscriptions', (ctx) => {
  const { test: it } = ctx;
  it('can subscribe', async () => {
    const client = await ctx.subscriptionClient();
    const result = await new Promise((resolve, reject) => {
      const subscription = client.subscribe({
        query: ctx.gql`
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
