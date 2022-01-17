import pluralize, { singular, plural, addIrregularRule } from 'pluralize';

addIrregularRule('calorie', 'calories');
addIrregularRule('celsius', 'celsius');
addIrregularRule('USD', 'USD');
addIrregularRule('EUR', 'EUR');
addIrregularRule('are', 'ares');
addIrregularRule('s', 's');
addIrregularRule('h', 'h');
addIrregularRule('psi', 'psi');
addIrregularRule('kph', 'kph');
addIrregularRule('mph', 'mph');
addIrregularRule('u', 'u');
addIrregularRule('lumen', 'lumen');

function pluralizeBigint(str: string, n: number | bigint = 2n) {
  return pluralize(str, Number(n));
}

export default pluralizeBigint;

export { singular, plural, addIrregularRule };
