/* eslint-env jest */
import waitForExpect from 'wait-for-expect';
import arc from '@architect/functions';
import {
  stringify as encodeCookie,
  parse as parseCookies,
} from 'simple-cookie';
import { encode as qsEncode } from 'querystring';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';

waitForExpect.defaults.interval = 250;

test('sign-in via magic link', (ctx) => {
  const { test: it } = ctx;
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
    });
  });

  // Can't do this because, without accessing the email, there is no way to know the token
  it.todo('visits the verification request link');
});
