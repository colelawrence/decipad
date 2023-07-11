/* eslint-env jest */
import waitForExpect from 'wait-for-expect';
import arc from '@architect/functions';
import {
  stringify as encodeCookie,
  parse as parseCookies,
} from 'simple-cookie';
import { encode as qsEncode } from 'querystring';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { VerificationRequestRecord } from '@decipad/backendtypes';

waitForExpect.defaults.interval = 250;

test('sign-in via magic link', (ctx) => {
  const { test: it } = ctx;
  let verificationRequest: VerificationRequestRecord;

  it('requests sign-in email', async () => {
    const csrfTokenResp = await ctx.http.call(`/api/auth/csrf`);
    const cookies = csrfTokenResp.headers.get('set-cookie');
    const parsedCookie = parseCookies(cookies!);
    expect(parsedCookie.name).toBe('next-auth.csrf-token');
    const csrfToken = decodeURIComponent(parsedCookie.value);
    const csrfTokenFirstPart = csrfToken.split('|')[0];

    await ctx.http.call(`/api/auth/signin/email`, {
      method: 'POST',
      headers: {
        Cookie: encodeCookie({
          name: 'next-auth.csrf-token',
          value: csrfToken,
          path: '/',
        }),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: qsEncode({
        email: 'test1@decipad.com',
        csrfToken: csrfTokenFirstPart,
        json: 'true',
        callbackUrl: `http://localhost:3000/`,
      }),
    });
  });

  it('a user key validation request was created', async () => {
    await waitForExpect(async () => {
      const data = await arc.tables();
      const verificationRequests = (
        await data.verificationrequests.query({
          IndexName: 'byIdentifier',
          KeyConditionExpression: 'identifier = :email',
          ExpressionAttributeValues: {
            ':email': 'test1@decipad.com',
          },
        })
      ).Items;

      expect(verificationRequests).toHaveLength(1);
      [verificationRequest] = verificationRequests;
      expect(verificationRequest).toMatchObject({
        id: expect.any(String),
        identifier: 'test1@decipad.com',
        expires: expect.any(Number),
        token: expect.any(String),
      });
    });
  });

  it('the user is not validated yet', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    const { self } = (
      await client.query({
        query: ctx.gql`
          query {
            self {
              id
              name
              emailValidatedAt
            }
          }
        `,
      })
    ).data;
    expect(self).toMatchInlineSnapshot(`
      {
        "__typename": "User",
        "emailValidatedAt": null,
        "id": "test user id 1",
        "name": "Test User",
      }
    `);
  });

  it('visits the verification request link', async () => {
    const link = `${
      ctx.http.origin
    }/api/auth/callback/email?callbackUrl=%2Fn%2Fwelcome&token=${encodeURIComponent(
      verificationRequest.openTokenForTestsOnly ?? ''
    )}&email=${encodeURIComponent(verificationRequest.identifier)}`;
    const res = await fetch(link, { redirect: 'manual' });
    expect(res.status).toEqual(302);
    expect(res.headers.get('Location')).toBeDefined();
  });

  it('the user is now validated', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    const { self } = (
      await client.query({
        query: ctx.gql`
          query {
            self {
              id
              name
              emailValidatedAt
            }
          }
        `,
      })
    ).data;
    expect(self).toMatchObject({
      emailValidatedAt: expect.any(String),
      id: 'test user id 1',
      name: 'Test User',
    });
  });
});
