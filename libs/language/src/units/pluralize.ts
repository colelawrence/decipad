import pluralize, { singular } from 'pluralize';

pluralize.addIrregularRule('celsius', 'celsius');

export { singular };
