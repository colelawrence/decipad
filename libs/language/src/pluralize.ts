import pluralize, { singular, plural, addIrregularRule } from 'pluralize';

addIrregularRule('calorie', 'calories');
addIrregularRule('celsius', 'celsius');
addIrregularRule('USD', 'USD');
addIrregularRule('EUR', 'EUR');
addIrregularRule('are', 'ares');

export default pluralize;
export { singular, plural, addIrregularRule };
