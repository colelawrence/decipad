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

const timeUnitStrings = new Set([
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
