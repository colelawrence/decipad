import pluralize, { singular, plural, addIrregularRule } from 'pluralize';

addIrregularRule('calorie', 'calories');
addIrregularRule('celsius', 'celsius');
addIrregularRule('USD', 'USD');
addIrregularRule('EUR', 'EUR');
addIrregularRule('are', 'are');
addIrregularRule('s', 's');

export default pluralize;
export { singular, plural };
