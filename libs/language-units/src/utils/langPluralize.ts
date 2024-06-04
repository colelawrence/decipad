import extPluralize, { singular, plural, addIrregularRule } from 'pluralize';

addIrregularRule('calorie', 'calories');
addIrregularRule('celsius', 'celsius');
addIrregularRule('siemens', 'siemens');
addIrregularRule('are', 'ares');
addIrregularRule('s', 's');
addIrregularRule('h', 'h');
addIrregularRule('psi', 'psi');
addIrregularRule('kph', 'kph');
addIrregularRule('mph', 'mph');
addIrregularRule('u', 'u');
addIrregularRule('lumen', 'lumen');
addIrregularRule('scarab', 'scarab');
addIrregularRule('previous', 'previous');

// easter eggs
addIrregularRule('lol', 'lulz');
addIrregularRule('lul', 'lulz');
addIrregularRule('omegalul', 'omegalulz');
addIrregularRule('UwU', 'UwU');
addIrregularRule('OwO', 'OwO');

function pluralizeBigint(str: string, n: number | bigint = 2n) {
  return extPluralize(str, Number(n));
}

export default pluralizeBigint;

const pluralize = (word: string, count?: number | bigint) =>
  extPluralize(word, count == null ? count : Number(count));

export { singular, plural, pluralize, addIrregularRule };
