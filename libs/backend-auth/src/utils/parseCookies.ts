import { parse as parseCookie } from 'simple-cookie';

export function parseCookies(cookies: string[] = []): Record<string, string> {
  return cookies.reduce<Record<string, string>>(
    (accCookies: Record<string, string>, cookie) => {
      const { name, value } = parseCookie(cookie) as {
        name: string;
        value: string;
      };
      // eslint-disable-next-line no-param-reassign
      accCookies[name] = decodeURIComponent(value);
      return accCookies;
    },
    {}
  );
}
