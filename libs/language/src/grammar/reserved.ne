@{%

const initialReservedWords = new Set([
  'in',
  'as',
  'to',
  'by',
  'contains',
  'where',
  'given',
  'per',
  'set',
  'categories',
  'true',
  'false',
  'if',
  'then',
  'else',
  'through',
  'select',
  'range',
  'date',
  'and',
  'not',
  'or',
  'with',
  'when',
  'over'
]);

const monthStrings = new Set([
  'Jan',
  'January',
  'Feb',
  'February',
  'Mar',
  'March',
  'Apr',
  'April',
  'May',
  'Jun',
  'June',
  'Jul',
  'July',
  'Aug',
  'August',
  'Sep',
  'September',
  'Oct',
  'October',
  'Nov',
  'November',
  'Dec',
  'December'
]);

// fixme: this is repeated in units.ts
// fixme: lots of other reserved words i think
const timeUnitStrings = new Set([
  'millennium',
  'millenniums',
  'millennia',
  'century',
  'centuries',
  'decade',
  'decades',
  'year',
  'years',
  'quarter',
  'quarters',
  'month',
  'months',
  'weeks',
  'week',
  'day',
  'days',
  'hour',
  'hours',
  'minute',
  'minutes',
  'second',
  'seconds',
  'millisecond',
  'milliseconds',
]);

const reservedWords = new Set(initialReservedWords);

function isReservedWord(str) {
  return reservedWords.has(str)
}

%}
