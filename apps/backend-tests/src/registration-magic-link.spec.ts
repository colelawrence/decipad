/* eslint-disable camelcase */
/* eslint-env jest */
import waitForExpect from 'wait-for-expect';
import arc from '@architect/functions';
import type { User } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';

waitForExpect.defaults.interval = 250;

type UserKeyValidation = {
  id: string;
  userkey_id: string;
  expires_at: number;
};

test('registration via magic link', (ctx) => {
  const { test: it } = ctx;
  let user: User;
  // let token: string;

  it('registers', async () => {
    const client = ctx.graphql.withoutAuth();
    user = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createUserViaMagicLink(email: "testuser1@decipad.com") {
              id
            }
          }
        `,
      })
    ).data.createUserViaMagicLink;

    expect(user).toBeDefined();
  });

  // TODO: enable this and enable user key validation emails
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('a user key validation request was created', async () => {
    await waitForExpect(async () => {
      const data = await arc.tables();
      const userKeys = (
        await data.userkeys.query({
          IndexName: 'byUserId',
          KeyConditionExpression: 'user_id = :user_id',
          ExpressionAttributeValues: {
            ':user_id': user.id,
          },
        })
      ).Items;

      expect(userKeys).toHaveLength(1);
      const userKey = userKeys[0];

      const userKeyValidations = (
        await data.userkeyvalidations.query({
          IndexName: 'byUserKeyId',
          KeyConditionExpression: 'userkey_id = :userkey_id',
          ExpressionAttributeValues: {
            ':userkey_id': userKey.id,
          },
        })
      ).Items as UserKeyValidation[];

      expect(userKeyValidations).toHaveLength(1);
    });
  });

  it('lets user update their name', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    const { self } = (
      await client.query({
        query: ctx.gql`
          query {
            self {
              id
              name
            }
          }
        `,
      })
    ).data;

    expect(self).toMatchObject({ id: 'test user id 1', name: 'Test User' });

    const selfAfter = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            updateSelf(props: { name: "My new name" }) {
              id
              name
            }
          }
        `,
      })
    ).data.updateSelf;

    expect(selfAfter).toMatchObject({
      id: 'test user id 1',
      name: 'My new name',
    });
  });

  it('does not let register twice with the same email', async () => {
    const client = ctx.graphql.withoutAuth();
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            createUserViaMagicLink(email: "testuser1@decipad.com") {
              id
            }
          }
        `,
      })
    ).rejects.toThrow('The given email address is already in use');
  }, 10000);
});
