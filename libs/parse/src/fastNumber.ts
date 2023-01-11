import DeciNumber, { N } from '@decipad/number';

const countDecimals = (n: number): [number, string | undefined] => {
  if (Math.floor(n.valueOf()) === n.valueOf()) return [0, undefined];
  const str = n.toString(10);
  if (str.indexOf('e') >= 0) {
    const parts = str.split('e');
    const [moreDecimals, fullNumber] = countDecimals(Number(parts[0]));
    return [-Number(parts[1]) + moreDecimals, fullNumber];
  }
  const parts = str.split('.');
  return [parts[1]?.length || 0, parts.join('')];
};

export const fastNumber = (n: number): DeciNumber => {
  const [decimalCount, fullNumber] = countDecimals(n);
  try {
    return decimalCount === 0
      ? N(n)
      : N(BigInt(fullNumber ?? ''), BigInt(10 ** decimalCount));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error trying to convert to number', n, [
      decimalCount,
      fullNumber,
    ]);
    throw err;
  }
};
