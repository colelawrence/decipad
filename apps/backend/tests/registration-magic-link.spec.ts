/* eslint-env jest */

import arc from '@architect/functions';
import { parse as parseCookie } from 'simple-cookie';
import test from './utils/test-with-sandbox';
import { withAuth, withoutAuth, gql } from './utils/call-graphql';
import { timeout } from './utils/timeout';

type UserKeyValidation = {
  id: string
  userkey_id: string
  expires_at: number
};

test('registration via magic link', () => {
  let user: User;
  let userKeyValidation: UserKeyValidation;
  let token: string;

  it('registers', async () => {
    const client = withoutAuth();
    user = (
      await client.mutate({
        mutation: gql`
          mutation {
            createUserViaMagicLink(email: "testuser1@decipad.com") {
              id
            }
          }
        `,
      })
    ).data.createUserViaMagicLink;

    expect(user).toBeDefined();
  }, 10000);

  it('waits a bit', async () => await timeout(2000));

  it('a user key validation request was created', async () => {
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
    userKeyValidation = userKeyValidations[0];
  });

  it('can ask to resend link', async () => {
    const client = withoutAuth();
    await client.mutate({
      mutation: gql`
        mutation {
          resendRegistrationMagicLinkEmail(email: "testuser1@decipad.com")
        }
      `,
    });
  });

  it('can visit that link and get authenticated', async () => {
    const link = `http://localhost:${process.env.PORT}/api/userkeyvalidations/${userKeyValidation.id}/validate?redirect=false`;
    const resp = await fetch(link);
    const cookie = resp.headers.get('set-cookie');
    expect(cookie).toMatch('next-auth.session-token=');
    token = parseCookie(cookie!).value;
  });

  it('no longer can ask to resend link', async () => {
    const client = withoutAuth();
    await expect(
      client.mutate({
        mutation: gql`
          mutation {
            resendRegistrationMagicLinkEmail(email: "testuser1@decipad.com")
          }
        `,
      })
    ).rejects.toThrow('User key already validated');
  });

  it('lets user update their name', async () => {
    const client = withAuth({ token });
    const self = (
      await client.query({
        query: gql`
          query {
            self {
              id
              name
            }
          }
        `,
      })
    ).data.self;

    expect(self).toMatchObject({ id: user.id, name: '' });

    const selfAfter = (
      await client.mutate({
        mutation: gql`
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
    const client = withoutAuth();
    await expect(
      client.mutate({
        mutation: gql`
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
