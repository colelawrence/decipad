/* eslint-disable camelcase */
/* eslint-env jest */

import waitForExpect from 'wait-for-expect';
import arc from '@architect/functions';
import { parse as parseCookie } from 'simple-cookie';
import { User } from '@decipad/backendtypes';
import test from './sandbox';

waitForExpect.defaults.interval = 250;

type UserKeyValidation = {
  id: string;
  userkey_id: string;
  expires_at: number;
};

test('registration via magic link', (ctx) => {
  const { test: it } = ctx;
  let user: User;
  let userKeyValidation: UserKeyValidation;
  let token: string;

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

  it('a user key validation request was created', async () => {
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
      [userKeyValidation] = userKeyValidations;
    });
  });

  // TODO merge WHEN test with THEN test?
  // eslint-disable-next-line jest/expect-expect
  it('can ask to resend link', async () => {
    const client = ctx.graphql.withoutAuth();
    await client.mutate({
      mutation: ctx.gql`
        mutation {
          resendRegistrationMagicLinkEmail(email: "testuser1@decipad.com")
        }
      `,
    });
  });

  it('can visit that link and get authenticated', async () => {
    const link = `/api/userkeyvalidations/${userKeyValidation.id}/validate?redirect=false`;
    const resp = await ctx.http.call(link);
    const cookie = resp.headers.get('set-cookie');
    expect(cookie).toMatch('next-auth.session-token=');
    token = parseCookie(cookie!).value;
  });

  it('no longer can ask to resend link', async () => {
    const client = ctx.graphql.withoutAuth();
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            resendRegistrationMagicLinkEmail(email: "testuser1@decipad.com")
          }
        `,
      })
    ).rejects.toThrow('User key already validated');
  });

  it('lets user update their name', async () => {
    const client = ctx.graphql.withAuth({ token });
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

    expect(self).toMatchObject({ id: user.id, name: '' });

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

    expect(selfAfter).toMatchObject({ id: user.id, name: 'My new name' });
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
