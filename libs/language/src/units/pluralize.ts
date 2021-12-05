import pluralize, { singular } from 'pluralize';

pluralize.addIrregularRule('USD', 'USD');
pluralize.addIrregularRule('EUR', 'EUR');
pluralize.addIrregularRule('are', 'are');
pluralize.addIrregularRule('celsius', 'celsius');
pluralize.addIrregularRule('s', 's');
pluralize.addIrregularRule('h', 'h');

export { singular };
