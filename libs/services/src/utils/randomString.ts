import { webcrypto } from 'crypto';

/**
 * Web compatible method to create a random string of a given length
 *
 * copy pasted from next-auth
 * @see https://github.com/nextauthjs/next-auth/blob/6c45abf38356d685a3a027d32e604b637209df16/packages/core/src/lib/web.ts#L115-L120
 * */
export function randomString(size: number) {
  const i2hex = (i: number) => `0${i.toString(16)}`.slice(-2);
  const r = (a: string, i: number): string => a + i2hex(i);
  const bytes = webcrypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes).reduce(r, '');
}
