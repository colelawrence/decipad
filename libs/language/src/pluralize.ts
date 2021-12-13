import pluralize, { singular, plural, addIrregularRule } from 'pluralize';

addIrregularRule('calorie', 'calories');
addIrregularRule('celsius', 'celsius');
addIrregularRule('USD', 'USD');
addIrregularRule('EUR', 'EUR');
addIrregularRule('are', 'ares');
addIrregularRule('s', 's');
pluralize.addIrregularRule('h', 'h');

function pluralizeBigint(str: string, n: number | bigint = 2n) {
  return pluralize(str, Number(n));
}

export default pluralizeBigint;

export { singular, plural, addIrregularRule };
