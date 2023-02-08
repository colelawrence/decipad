import DeciNumber, { N, ZERO } from '@decipad/number';

const toNumber = (n: number | bigint | string): bigint | number | undefined => {
  if (typeof n === 'number' || typeof n === 'bigint') {
    return n;
  }
  const res = Number(n.replaceAll(/[^.0-9]/g, ''));
  if (Number.isNaN(res)) {
    // eslint-disable-next-line no-console
    console.warn(`"${res}" was not parsable to a number`);
    return undefined;
  }
  return res;
};

const countDecimals = (
  _n: number | bigint | string
): [number, string | undefined] => {
  const n = toNumber(_n);
  if (n == null) {
    return [0, undefined];
  }
  if (Math.floor(Number(n.valueOf())) === Number(n.valueOf()))
    return [0, undefined];
  const str = n.toString(10);
  if (str.indexOf('e') >= 0) {
    const parts = str.split('e');
    const [moreDecimals, fullNumber] = countDecimals(Number(parts[0]));
    return [-Number(parts[1]) + moreDecimals, fullNumber];
  }
  const parts = str.split('.');
  return [parts[1]?.length || 0, parts.join('')];
};

export const fastNumber = (n: number | string): DeciNumber => {
  const [decimalCount, fullNumber] = countDecimals(n);
  try {
    if (typeof fullNumber === 'string' && fullNumber.length < 1) {
      return ZERO;
    }
    return decimalCount === 0
      ? N(toNumber(n))
      : N(toNumber(fullNumber ?? ''), BigInt(10 ** decimalCount));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      'Error trying to convert to number',
      n,
      [decimalCount, fullNumber],
      err
    );
    throw err;
  }
};
