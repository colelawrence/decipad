// eslint-disable-next-line import/no-extraneous-dependencies
import {
  parse as parseCookie,
  stringify as stringifyCookie,
} from 'simple-cookie';

export const authCookieHeader = (cookies: string[]): HeadersInit => {
  const authCookies = cookies
    .map((cookie) => parseCookie(cookie))
    .filter((cookie) => cookie.name.includes('session-token'));
  if (authCookies.length > 0) {
    return {
      cookie: stringifyCookie(authCookies[0]),
    };
  }
  return {};
};
