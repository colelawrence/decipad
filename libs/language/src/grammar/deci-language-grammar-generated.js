// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) {
  return x[0];
}

import { tokenizer } from './tokenizer';

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
  'over',
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
  'December',
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
  return reservedWords.has(str);
}

const _getStart = (tokOrNode) =>
  tokOrNode.offset != null ? tokOrNode.offset : tokOrNode.start;

const _getEnd = (tokOrNode) =>
  tokOrNode.offset != null
    ? tokOrNode.offset + tokOrNode.text.length - 1
    : tokOrNode.end;

const noEndToken = Symbol('no end token was passed');
function addLoc(node, start, end = start) {
  node.start = _getStart(start);
  node.end = _getEnd(end);

  if (typeof node.start !== 'number' || typeof node.end !== 'number') {
    throw new Error(
      'Bad start or end at ' +
        JSON.stringify(node, null, 2) +
        '\n\n-- given: ' +
        JSON.stringify({ start, end }, null, 2) +
        ''
    );
  } else {
    return node;
  }
}

function getLocationFromArray(locArray) {
  // Most of the time it's really easy to find
  const shortCircuitStart = locArray[0] && _getStart(locArray[0]);
  const shortCircuitEnd =
    locArray[locArray.length - 1] && _getEnd(locArray[locArray.length - 1]);
  if (shortCircuitEnd != null && shortCircuitStart != null) {
    return [shortCircuitStart, shortCircuitEnd];
  }

  let start = null;
  let end = null;

  const foundToken = (tokOrNode) => {
    if (tokOrNode != null) {
      const newStart = _getStart(tokOrNode);
      const newEnd = _getEnd(tokOrNode);

      if (newStart != null && newEnd != null) {
        if (start == null) {
          start = newStart;
        }
        end = newEnd;
      }
    }
  };

  (function recurse(array) {
    if (array == null) return;

    if (Array.isArray(array)) {
      for (const item of array) {
        recurse(item);
      }
    } else {
      foundToken(array);
    }
  })(locArray);

  return [start, end];
}

function addArrayLoc(node, locArray) {
  const [start, end] = getLocationFromArray(locArray);
  node.start = start;
  node.end = end;
  if (typeof node.start !== 'number' || typeof node.end !== 'number') {
    throw new Error(
      'Bad start or end at ' +
        JSON.stringify(node, null, 2) +
        '\n\n-- given: ' +
        JSON.stringify({ start, end }, null, 2) +
        ''
    );
  } else {
    return node;
  }
}

import Fraction from '@decipad/fraction';

function numberLiteralFromUnits(parentNode, n, units) {
  const fraction = n instanceof Fraction ? n : new Fraction(n);

  const node = {
    type: 'literal',
    args: ['number', fraction],
  };
  if (Array.isArray(parentNode)) {
    return addArrayLoc(node, parentNode);
  }
  return addLoc(node, parentNode);
}

const returnMonth = (month) => () => ({ month });

const joinDateParts = (dateParts) => {
  let parts = dateParts.args;

  if (dateParts.nextDateInner) {
    parts = parts.concat(joinDateParts(dateParts.nextDateInner));
  }

  // Timezone is last, always
  if (dateParts.timezone) {
    parts = parts.concat(dateParts.timezone);
  }

  return parts;
};

const makeDateFragmentReader =
  (key, len, min, max) =>
  ([{ text }], _l, reject) => {
    try {
      const number = BigInt(text);
      if (text.length !== len || number < min || number > max) {
        return reject;
      } else {
        return { [key]: number };
      }
    } catch (err) {
      return reject;
    }
  };

const implicitMultHandler = (d, _l, reject) => {
  const left = d[0];
  const right = d[2] || d[1];

  // disambiguate things like `2 - 1` <- this is not `2 * (- 1)`!
  if (right.type === 'function-call') {
    const funcRef = right.args[0];
    if (funcRef.type === 'funcref') {
      const funcName = funcRef.args[0];
      if (funcName === 'unary-') {
        return reject;
      }
    }
  }

  return addArrayLoc(
    {
      type: 'function-call',
      args: [
        {
          type: 'funcref',
          args: ['*'],
        },
        addArrayLoc(
          {
            type: 'argument-list',
            args: [left, right],
          },
          d
        ),
      ],
    },
    d
  );
};

const unaryMinusHandler = (d) => {
  const expr = d[2];
  return addArrayLoc(
    {
      type: 'function-call',
      args: [
        addLoc(
          {
            type: 'funcref',
            args: ['unary-'],
          },
          d[0]
        ),
        addLoc(
          {
            type: 'argument-list',
            args: [d[2]],
          },
          d[2]
        ),
      ],
    },
    d
  );
};
let Lexer = tokenizer;
let ParserRules = [
  {
    name: '_$ebnf$1',
    symbols: [tokenizer.has('ws') ? { type: 'ws' } : ws],
    postprocess: id,
  },
  {
    name: '_$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  { name: '_', symbols: ['_$ebnf$1'], postprocess: id },
  {
    name: '__',
    symbols: [tokenizer.has('ws') ? { type: 'ws' } : ws],
    postprocess: id,
  },
  {
    name: '__n',
    symbols: [tokenizer.has('ws') ? { type: 'ws' } : ws],
    postprocess: (d, _l, reject) => {
      if (!d[0].value.includes('\n')) {
        return reject;
      } else {
        return d[0];
      }
    },
  },
  { name: 'literal', symbols: ['boolean'], postprocess: id },
  { name: 'literal', symbols: ['string'], postprocess: id },
  { name: 'literal', symbols: ['number'], postprocess: id },
  { name: 'literal', symbols: ['percentage'], postprocess: id },
  { name: 'literal', symbols: ['column'], postprocess: id },
  { name: 'literal', symbols: ['date'], postprocess: id },
  { name: 'literal', symbols: ['range'], postprocess: id },
  { name: 'literal', symbols: ['sequence'], postprocess: id },
  {
    name: 'boolean',
    symbols: [{ literal: 'true' }],
    postprocess: (d) =>
      addLoc(
        {
          type: 'literal',
          args: ['boolean', true],
        },
        d[0]
      ),
  },
  {
    name: 'boolean',
    symbols: [{ literal: 'false' }],
    postprocess: (d) =>
      addLoc(
        {
          type: 'literal',
          args: ['boolean', false],
        },
        d[0]
      ),
  },
  {
    name: 'number',
    symbols: ['unitlessNumber'],
    postprocess: ([n]) => {
      return numberLiteralFromUnits(n, n.n);
    },
  },
  {
    name: 'number',
    symbols: [{ literal: '-' }, 'unitlessNumber'],
    postprocess: (d) => {
      return numberLiteralFromUnits(d, new Fraction(d[1].n).neg());
    },
  },
  {
    name: 'percentage',
    symbols: [{ literal: '-' }, 'decimal', { literal: '%' }],
    postprocess: (d) => {
      return addArrayLoc(
        numberLiteralFromUnits(
          d,
          new Fraction(d[1].n.neg()).div(new Fraction(100))
        ),
        d
      );
    },
  },
  {
    name: 'percentage',
    symbols: ['decimal', { literal: '%' }],
    postprocess: (d) => {
      return addArrayLoc(
        numberLiteralFromUnits(d, new Fraction(d[0].n).div(new Fraction(100))),
        d
      );
    },
  },
  {
    name: 'unitlessNumber',
    symbols: [tokenizer.has('number') ? { type: 'number' } : number],
    postprocess: ([number]) => {
      return addLoc(
        {
          n: number.value,
        },
        number
      );
    },
  },
  {
    name: 'int',
    symbols: [tokenizer.has('number') ? { type: 'number' } : number],
    postprocess: ([number], _l, reject) => {
      if (/[.eE]/.test(number.value)) {
        return reject;
      } else {
        return addLoc(
          {
            n: BigInt(number.value),
          },
          number
        );
      }
    },
  },
  {
    name: 'int',
    symbols: [{ literal: '-' }, 'int'],
    postprocess: (d) => {
      const n = -d[1].n;
      return addArrayLoc({ n }, d);
    },
  },
  {
    name: 'decimal',
    symbols: [tokenizer.has('number') ? { type: 'number' } : number],
    postprocess: ([number], _l, reject) => {
      if (/[eE]/.test(number.value)) {
        return reject;
      } else {
        return addLoc(
          {
            n: new Fraction(number.value),
          },
          number
        );
      }
    },
  },
  {
    name: 'string',
    symbols: [tokenizer.has('string') ? { type: 'string' } : string],
    postprocess: ([string]) => {
      return addLoc(
        {
          type: 'literal',
          args: ['string', string.value],
        },
        string
      );
    },
  },
  {
    name: 'date',
    symbols: [
      tokenizer.has('beginDate') ? { type: 'beginDate' } : beginDate,
      '_',
      'dateInner',
      '_',
      tokenizer.has('endDate') ? { type: 'endDate' } : endDate,
    ],
    postprocess: (d) => {
      return addLoc(
        {
          type: 'date',
          args: joinDateParts(d[2]),
        },
        d[0],
        d[4]
      );
    },
  },
  { name: 'dateInner$ebnf$1', symbols: ['dateInnerMonth'], postprocess: id },
  {
    name: 'dateInner$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'dateInner',
    symbols: ['dateYear', 'dateInner$ebnf$1'],
    postprocess: (d) => ({
      type: 'date',
      args: ['year', d[0].year],
      nextDateInner: d[1],
    }),
  },
  { name: 'dateInnerMonth$ebnf$1', symbols: ['dateInnerDay'], postprocess: id },
  {
    name: 'dateInnerMonth$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'dateInnerMonth',
    symbols: ['dateSeparator', 'dateMonth', 'dateInnerMonth$ebnf$1'],
    postprocess: (d) => ({
      type: 'date',
      args: ['month', d[1].month],
      nextDateInner: d[2],
    }),
  },
  { name: 'dateInnerDay$ebnf$1', symbols: ['dateInnerHour'], postprocess: id },
  {
    name: 'dateInnerDay$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'dateInnerDay',
    symbols: ['dateSeparator', 'dateDay', 'dateInnerDay$ebnf$1'],
    postprocess: (d) => ({
      type: 'date',
      args: ['day', d[1].day],
      nextDateInner: d[2],
    }),
  },
  { name: 'dateInnerHour$subexpression$1', symbols: [{ literal: ' ' }] },
  { name: 'dateInnerHour$subexpression$1', symbols: [{ literal: 'T' }] },
  {
    name: 'dateInnerHour$ebnf$1',
    symbols: ['dateInnerMinute'],
    postprocess: id,
  },
  {
    name: 'dateInnerHour$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  { name: 'dateInnerHour$ebnf$2', symbols: ['dateTimeZone'], postprocess: id },
  {
    name: 'dateInnerHour$ebnf$2',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'dateInnerHour',
    symbols: [
      'dateInnerHour$subexpression$1',
      'dateHour',
      'dateInnerHour$ebnf$1',
      'dateInnerHour$ebnf$2',
    ],
    postprocess: (d) => ({
      type: 'date',
      args: ['hour', d[1].hour],
      nextDateInner: d[2],
      timezone: d[3] ? ['timezone', d[3].timezone] : [],
    }),
  },
  {
    name: 'dateInnerMinute$ebnf$1',
    symbols: ['dateInnerSecond'],
    postprocess: id,
  },
  {
    name: 'dateInnerMinute$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'dateInnerMinute',
    symbols: [{ literal: ':' }, 'dateMinute', 'dateInnerMinute$ebnf$1'],
    postprocess: (d) => ({
      type: 'date',
      args: ['minute', d[1].minute],
      nextDateInner: d[2],
    }),
  },
  {
    name: 'dateInnerSecond$ebnf$1',
    symbols: ['dateInnerMillisecond'],
    postprocess: id,
  },
  {
    name: 'dateInnerSecond$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'dateInnerSecond',
    symbols: [{ literal: ':' }, 'dateSecond', 'dateInnerSecond$ebnf$1'],
    postprocess: (d) => ({
      type: 'date',
      args: ['second', d[1].second],
      nextDateInner: d[2],
    }),
  },
  {
    name: 'dateInnerMillisecond',
    symbols: [{ literal: '.' }, 'dateMillisecond'],
    postprocess: (d) => ({
      type: 'date',
      args: ['millisecond', d[1].millisecond],
      nextDateInner: null,
    }),
  },
  {
    name: 'dateYear',
    symbols: [tokenizer.has('digits') ? { type: 'digits' } : digits],
    postprocess: makeDateFragmentReader('year', 4, 0, 9999),
  },
  {
    name: 'dateMonth',
    symbols: [tokenizer.has('digits') ? { type: 'digits' } : digits],
    postprocess: makeDateFragmentReader('month', 2, 1, 12),
  },
  { name: 'dateMonth', symbols: ['literalMonth'], postprocess: id },
  {
    name: 'dateDay',
    symbols: [tokenizer.has('digits') ? { type: 'digits' } : digits],
    postprocess: makeDateFragmentReader('day', 2, 1, 31),
  },
  {
    name: 'dateHour',
    symbols: [tokenizer.has('digits') ? { type: 'digits' } : digits],
    postprocess: makeDateFragmentReader('hour', 2, 0, 23),
  },
  {
    name: 'dateMinute',
    symbols: [tokenizer.has('digits') ? { type: 'digits' } : digits],
    postprocess: makeDateFragmentReader('minute', 2, 0, 59),
  },
  {
    name: 'dateSecond',
    symbols: [tokenizer.has('digits') ? { type: 'digits' } : digits],
    postprocess: makeDateFragmentReader('second', 2, 0, 59),
  },
  {
    name: 'dateMillisecond',
    symbols: [tokenizer.has('digits') ? { type: 'digits' } : digits],
    postprocess: makeDateFragmentReader('millisecond', 3, 0, 999),
  },
  { name: 'literalMonth$subexpression$1', symbols: [{ literal: 'Jan' }] },
  { name: 'literalMonth$subexpression$1', symbols: [{ literal: 'January' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$1'],
    postprocess: returnMonth(1n),
  },
  { name: 'literalMonth$subexpression$2', symbols: [{ literal: 'Feb' }] },
  { name: 'literalMonth$subexpression$2', symbols: [{ literal: 'February' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$2'],
    postprocess: returnMonth(2n),
  },
  { name: 'literalMonth$subexpression$3', symbols: [{ literal: 'Mar' }] },
  { name: 'literalMonth$subexpression$3', symbols: [{ literal: 'March' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$3'],
    postprocess: returnMonth(3n),
  },
  { name: 'literalMonth$subexpression$4', symbols: [{ literal: 'Apr' }] },
  { name: 'literalMonth$subexpression$4', symbols: [{ literal: 'April' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$4'],
    postprocess: returnMonth(4n),
  },
  {
    name: 'literalMonth',
    symbols: [{ literal: 'May' }],
    postprocess: returnMonth(5n),
  },
  { name: 'literalMonth$subexpression$5', symbols: [{ literal: 'Jun' }] },
  { name: 'literalMonth$subexpression$5', symbols: [{ literal: 'June' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$5'],
    postprocess: returnMonth(6n),
  },
  { name: 'literalMonth$subexpression$6', symbols: [{ literal: 'Jul' }] },
  { name: 'literalMonth$subexpression$6', symbols: [{ literal: 'July' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$6'],
    postprocess: returnMonth(7n),
  },
  { name: 'literalMonth$subexpression$7', symbols: [{ literal: 'Aug' }] },
  { name: 'literalMonth$subexpression$7', symbols: [{ literal: 'August' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$7'],
    postprocess: returnMonth(8n),
  },
  { name: 'literalMonth$subexpression$8', symbols: [{ literal: 'Sep' }] },
  { name: 'literalMonth$subexpression$8', symbols: [{ literal: 'September' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$8'],
    postprocess: returnMonth(9n),
  },
  { name: 'literalMonth$subexpression$9', symbols: [{ literal: 'Oct' }] },
  { name: 'literalMonth$subexpression$9', symbols: [{ literal: 'October' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$9'],
    postprocess: returnMonth(10n),
  },
  { name: 'literalMonth$subexpression$10', symbols: [{ literal: 'Nov' }] },
  { name: 'literalMonth$subexpression$10', symbols: [{ literal: 'November' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$10'],
    postprocess: returnMonth(11n),
  },
  { name: 'literalMonth$subexpression$11', symbols: [{ literal: 'Dec' }] },
  { name: 'literalMonth$subexpression$11', symbols: [{ literal: 'December' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$11'],
    postprocess: returnMonth(12n),
  },
  {
    name: 'dateTimeZone',
    symbols: [{ literal: 'Z' }],
    postprocess: (d) => ({
      timezone: {
        hours: 0,
        minutes: 0,
      },
    }),
  },
  { name: 'dateTimeZone$subexpression$1', symbols: [{ literal: '+' }] },
  { name: 'dateTimeZone$subexpression$1', symbols: [{ literal: '-' }] },
  {
    name: 'dateTimeZone$ebnf$1$subexpression$1',
    symbols: [
      { literal: ':' },
      tokenizer.has('digits') ? { type: 'digits' } : digits,
    ],
  },
  {
    name: 'dateTimeZone$ebnf$1',
    symbols: ['dateTimeZone$ebnf$1$subexpression$1'],
    postprocess: id,
  },
  {
    name: 'dateTimeZone$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'dateTimeZone',
    symbols: [
      'dateTimeZone$subexpression$1',
      tokenizer.has('digits') ? { type: 'digits' } : digits,
      'dateTimeZone$ebnf$1',
    ],
    postprocess: ([sign, h, m]) => {
      let hours = Number(h.value);
      let minutes = m ? Number(m[1].value) : 0;

      if (sign[0].value === '-') {
        hours = -hours;
        minutes = -minutes;
      }

      return { timezone: { hours, minutes } };
    },
  },
  { name: 'dateSeparator$subexpression$1', symbols: [{ literal: '-' }] },
  { name: 'dateSeparator$subexpression$1', symbols: [{ literal: '/' }] },
  {
    name: 'dateSeparator',
    symbols: ['dateSeparator$subexpression$1'],
    postprocess: id,
  },
  {
    name: 'column',
    symbols: [{ literal: '[' }, '_', { literal: ']' }],
    postprocess: (d) =>
      addLoc(
        {
          type: 'column',
          args: [
            addLoc(
              {
                type: 'column-items',
                args: [],
              },
              d[1]
            ),
          ],
        },
        d[0],
        d[2]
      ),
  },
  {
    name: 'column',
    symbols: [{ literal: '[' }, 'columnItems', { literal: ']' }],
    postprocess: (d, _l, reject) => {
      if (
        d[1].args.every(
          (elem) =>
            elem.type === 'literal' &&
            elem.args[0] === 'number' &&
            elem.args[2]?.args.length === 1 &&
            timeUnitStrings.has(elem.args[2].args[0].unit)
        )
      ) {
        return reject;
      } else {
        return addArrayLoc(
          {
            type: 'column',
            args: [d[1]],
          },
          d
        );
      }
    },
  },
  { name: 'columnItems$ebnf$1', symbols: [] },
  {
    name: 'columnItems$ebnf$1$subexpression$1',
    symbols: ['_', { literal: ',' }, '_', 'expression'],
  },
  {
    name: 'columnItems$ebnf$1',
    symbols: ['columnItems$ebnf$1', 'columnItems$ebnf$1$subexpression$1'],
    postprocess: function arrpush(d) {
      return d[0].concat([d[1]]);
    },
  },
  {
    name: 'columnItems$ebnf$2$subexpression$1',
    symbols: ['_', { literal: ',' }],
  },
  {
    name: 'columnItems$ebnf$2',
    symbols: ['columnItems$ebnf$2$subexpression$1'],
    postprocess: id,
  },
  {
    name: 'columnItems$ebnf$2',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'columnItems',
    symbols: [
      '_',
      'expression',
      'columnItems$ebnf$1',
      'columnItems$ebnf$2',
      '_',
    ],
    postprocess: (d, _l, reject) => {
      return addArrayLoc(
        {
          type: 'column-items',
          args: [d[1], ...d[2].map((listItem) => listItem[3])],
        },
        d
      );
    },
  },
  {
    name: 'table',
    symbols: [{ literal: '{' }, 'tableContents', { literal: '}' }],
    postprocess: (d) => {
      return addArrayLoc(
        {
          type: 'table',
          args: d[1],
        },
        d
      );
    },
  },
  { name: 'tableContents', symbols: ['_'], postprocess: (d) => [] },
  { name: 'tableContents$ebnf$1', symbols: [] },
  {
    name: 'tableContents$ebnf$1$subexpression$1',
    symbols: ['tableSep', 'tableItem'],
  },
  {
    name: 'tableContents$ebnf$1',
    symbols: ['tableContents$ebnf$1', 'tableContents$ebnf$1$subexpression$1'],
    postprocess: function arrpush(d) {
      return d[0].concat([d[1]]);
    },
  },
  {
    name: 'tableContents',
    symbols: ['_', 'tableItem', 'tableContents$ebnf$1', '_'],
    postprocess: ([_ws, first, rest]) => {
      const coldefs = [first];

      for (const [_sep, coldef] of rest ?? []) {
        coldefs.push(coldef);
      }

      return coldefs;
    },
  },
  {
    name: 'tableItem',
    symbols: ['identifier'],
    postprocess: ([ref]) => {
      return addLoc(
        {
          type: 'table-column',
          args: [
            addLoc({ type: 'coldef', args: [ref.name] }, ref),
            addLoc({ type: 'ref', args: [ref.name] }, ref),
          ],
        },
        ref
      );
    },
  },
  {
    name: 'tableItem',
    symbols: [{ literal: '...' }, 'ref'],
    postprocess: (d) => {
      return addArrayLoc(
        {
          type: 'table-spread',
          args: [d[1]],
        },
        d
      );
    },
  },
  {
    name: 'tableItem',
    symbols: ['identifier', '_', { literal: '=' }, '_', 'expression'],
    postprocess: (d) => {
      const ref = d[0];

      const colDef = addLoc(
        {
          type: 'coldef',
          args: [ref.name],
        },
        ref
      );

      return addArrayLoc(
        {
          type: 'table-column',
          args: [colDef, d[4]],
        },
        d
      );
    },
  },
  {
    name: 'tableItem',
    symbols: [
      'identifier',
      '_',
      'tableFormulaArg',
      '_',
      { literal: '=' },
      '_',
      'expression',
    ],
    postprocess: (d) => {
      const [theDef, , rowArgName, , , , body] = d;

      const colDef = addLoc(
        {
          type: 'coldef',
          args: [theDef.name],
        },
        theDef
      );

      return addArrayLoc(
        {
          type: 'table-formula',
          args: [
            colDef,
            rowArgName,
            addArrayLoc(
              {
                type: 'block',
                args: [body],
              },
              body
            ),
          ],
        },
        d
      );
    },
  },
  {
    name: 'tableFormulaArg',
    symbols: [{ literal: '(' }, '_', 'identifier', '_', { literal: ')' }],
    postprocess: (d) => {
      const ident = d[2];
      return addLoc(
        {
          type: 'def',
          args: [ident.name],
        },
        ident
      );
    },
  },
  { name: 'tableSep$subexpression$1', symbols: ['__n'] },
  { name: 'tableSep$subexpression$1', symbols: ['_', { literal: ',' }, '_'] },
  { name: 'tableSep', symbols: ['tableSep$subexpression$1'], postprocess: id },
  {
    name: 'select',
    symbols: [
      { literal: 'select' },
      '_',
      { literal: '(' },
      '_',
      'selectedColumns',
      '_',
      { literal: ')' },
    ],
    postprocess: (d) => {
      const ref = d[4];

      return addArrayLoc(
        {
          type: 'directive',
          args: ['select', ...ref],
        },
        d
      );
    },
  },
  {
    name: 'selectedColumns$ebnf$1',
    symbols: [{ literal: ',' }],
    postprocess: id,
  },
  {
    name: 'selectedColumns$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'selectedColumns$ebnf$2$subexpression$1$ebnf$1',
    symbols: [{ literal: ',' }],
    postprocess: id,
  },
  {
    name: 'selectedColumns$ebnf$2$subexpression$1$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'selectedColumns$ebnf$2$subexpression$1',
    symbols: [
      'genericIdentifier',
      '_',
      'selectedColumns$ebnf$2$subexpression$1$ebnf$1',
      '_',
    ],
  },
  {
    name: 'selectedColumns$ebnf$2',
    symbols: ['selectedColumns$ebnf$2$subexpression$1'],
  },
  {
    name: 'selectedColumns$ebnf$2$subexpression$2$ebnf$1',
    symbols: [{ literal: ',' }],
    postprocess: id,
  },
  {
    name: 'selectedColumns$ebnf$2$subexpression$2$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'selectedColumns$ebnf$2$subexpression$2',
    symbols: [
      'genericIdentifier',
      '_',
      'selectedColumns$ebnf$2$subexpression$2$ebnf$1',
      '_',
    ],
  },
  {
    name: 'selectedColumns$ebnf$2',
    symbols: [
      'selectedColumns$ebnf$2',
      'selectedColumns$ebnf$2$subexpression$2',
    ],
    postprocess: function arrpush(d) {
      return d[0].concat([d[1]]);
    },
  },
  {
    name: 'selectedColumns',
    symbols: [
      'ref',
      '_',
      'selectedColumns$ebnf$1',
      '_',
      'selectedColumns$ebnf$2',
    ],
    postprocess: (d) => {
      const ref = d[0];
      const cols = addArrayLoc(
        {
          type: 'generic-list',
          args: d[4].map(([ident]) => ident),
        },
        d[4]
      );

      return [ref, cols];
    },
  },
  { name: 'expression', symbols: ['overExp'], postprocess: id },
  { name: 'expression', symbols: ['importData'], postprocess: id },
  { name: 'overExp', symbols: ['asExp'], postprocess: id },
  {
    name: 'overExp',
    symbols: ['overExp', '_', { literal: 'over' }, '_', 'genericIdentifier'],
    postprocess: (d) => {
      return addArrayLoc(
        {
          type: 'directive',
          args: ['over', d[0], d[4]],
        },
        d
      );
    },
  },
  { name: 'asExp', symbols: ['divMulOp'], postprocess: id },
  { name: 'asExp$subexpression$1', symbols: [{ literal: 'as' }] },
  { name: 'asExp$subexpression$1', symbols: [{ literal: 'to' }] },
  { name: 'asExp$subexpression$1', symbols: [{ literal: 'in' }] },
  {
    name: 'asExp',
    symbols: ['asExp', '_', 'asExp$subexpression$1', '_', 'divMulOp'],
    postprocess: (d) => {
      const exp = d[0];
      const unit = d[4];
      return addArrayLoc(
        {
          type: 'directive',
          args: ['as', exp, unit],
        },
        d
      );
    },
  },
  { name: 'divMulOp', symbols: ['addSubOp'], postprocess: id },
  {
    name: 'divMulOp',
    symbols: ['divMulOp', '_', 'additiveOperator', '_', 'addSubOp'],
    postprocess: (d, _l, reject) => {
      const left = d[0];
      const op = d[2];
      const right = d[4];

      if (
        op.name === '+' &&
        left.type === 'date' &&
        right.type === 'literal' &&
        right.args[0] === 'number'
      ) {
        return reject;
      }

      return addArrayLoc(
        {
          type: 'function-call',
          args: [
            addLoc(
              {
                type: 'funcref',
                args: [op.name],
              },
              op
            ),
            addArrayLoc(
              {
                type: 'argument-list',
                args: [left, right],
              },
              d
            ),
          ],
        },
        d
      );
    },
  },
  { name: 'addSubOp', symbols: ['implicitMult'], postprocess: id },
  {
    name: 'addSubOp',
    symbols: ['addSubOp', '_', 'multOp', '_', 'implicitMult'],
    postprocess: (d) => {
      const left = d[0];
      const op = d[2];
      const right = d[4];

      return addArrayLoc(
        {
          type: 'function-call',
          args: [
            addLoc(
              {
                type: 'funcref',
                args: [op.name],
              },
              op
            ),
            addArrayLoc(
              {
                type: 'argument-list',
                args: [left, right],
              },
              d
            ),
          ],
        },
        d
      );
    },
  },
  { name: 'implicitMult', symbols: ['primary'], postprocess: id },
  {
    name: 'implicitMult',
    symbols: ['implicitMult', 'ref'],
    postprocess: implicitMultHandler,
  },
  {
    name: 'implicitMult',
    symbols: ['implicitMult', '__', 'primary'],
    postprocess: implicitMultHandler,
  },
  { name: 'primary', symbols: ['functionCall'], postprocess: id },
  { name: 'primary', symbols: ['select'], postprocess: id },
  { name: 'primary', symbols: ['literal'], postprocess: id },
  { name: 'primary', symbols: ['ref'], postprocess: id },
  { name: 'primary', symbols: ['parenthesizedExpression'], postprocess: id },
  {
    name: 'primary',
    symbols: [{ literal: '-' }, '_', 'parenthesizedExpression'],
    postprocess: unaryMinusHandler,
  },
  {
    name: 'primary',
    symbols: [{ literal: '-' }, '_', 'ref'],
    postprocess: unaryMinusHandler,
  },
  { name: 'primary$subexpression$1', symbols: [{ literal: '!' }] },
  { name: 'primary$subexpression$1', symbols: [{ literal: 'not' }] },
  {
    name: 'primary',
    symbols: ['primary$subexpression$1', '_', 'expression'],
    postprocess: (d) => {
      return addArrayLoc(
        {
          type: 'function-call',
          args: [
            addLoc(
              {
                type: 'funcref',
                args: ['not'],
              },
              d[0][0]
            ),
            addLoc(
              {
                type: 'argument-list',
                args: [d[2]],
              },
              d[2]
            ),
          ],
        },
        d
      );
    },
  },
  {
    name: 'primary',
    symbols: ['primary', '_', { literal: '^' }, '_', 'int'],
    postprocess: (d) => {
      const left = d[0];
      const right = numberLiteralFromUnits(d, d[4].n);

      return addArrayLoc(
        {
          type: 'function-call',
          args: [
            {
              type: 'funcref',
              args: ['^'],
            },
            addArrayLoc(
              {
                type: 'argument-list',
                args: [left, right],
              },
              d
            ),
          ],
        },
        d
      );
    },
  },
  { name: 'primary$subexpression$2', symbols: ['ref'] },
  { name: 'primary$subexpression$2', symbols: ['functionCall'] },
  { name: 'primary$subexpression$2', symbols: ['parenthesizedExpression'] },
  { name: 'primary$subexpression$2', symbols: ['select'] },
  {
    name: 'primary',
    symbols: [
      'primary$subexpression$2',
      '_',
      { literal: '.' },
      '_',
      tokenizer.has('identifier') ? { type: 'identifier' } : identifier,
    ],
    postprocess: (d) =>
      addArrayLoc(
        {
          type: 'property-access',
          args: [d[0][0], d[4].value],
        },
        d
      ),
  },
  {
    name: 'parenthesizedExpression',
    symbols: [{ literal: '(' }, '_', 'expression', '_', { literal: ')' }],
    postprocess: (d) => addArrayLoc(d[2], d),
  },
  { name: 'additiveOperator$subexpression$1', symbols: [{ literal: '-' }] },
  { name: 'additiveOperator$subexpression$1', symbols: [{ literal: '+' }] },
  { name: 'additiveOperator$subexpression$1', symbols: [{ literal: '&&' }] },
  { name: 'additiveOperator$subexpression$1', symbols: [{ literal: '||' }] },
  { name: 'additiveOperator$subexpression$1', symbols: [{ literal: 'or' }] },
  { name: 'additiveOperator$subexpression$1', symbols: [{ literal: 'and' }] },
  {
    name: 'additiveOperator',
    symbols: ['additiveOperator$subexpression$1'],
    postprocess: (d) => {
      const op = d[0][0].value;
      return addArrayLoc(
        {
          name: op,
        },
        d
      );
    },
  },
  { name: 'multOp$subexpression$1', symbols: [{ literal: '**' }] },
  { name: 'multOp$subexpression$1', symbols: [{ literal: '>' }] },
  { name: 'multOp$subexpression$1', symbols: [{ literal: '<' }] },
  { name: 'multOp$subexpression$1', symbols: [{ literal: '<=' }] },
  { name: 'multOp$subexpression$1', symbols: [{ literal: '>=' }] },
  { name: 'multOp$subexpression$1', symbols: [{ literal: '==' }] },
  { name: 'multOp$subexpression$1', symbols: [{ literal: '!=' }] },
  { name: 'multOp$subexpression$1', symbols: [{ literal: 'contains' }] },
  { name: 'multOp$subexpression$1', symbols: [{ literal: ' %' }] },
  {
    name: 'multOp',
    symbols: ['multOp$subexpression$1'],
    postprocess: (d) => {
      return addArrayLoc(
        {
          name: d[0].map((t) => t.value).join(''),
        },
        d[0]
      );
    },
  },
  {
    name: 'multOp',
    symbols: ['__', { literal: '%' }],
    postprocess: (d) => {
      return addArrayLoc(
        {
          name: d[1].value,
        },
        d
      );
    },
  },
  { name: 'multOp$subexpression$2', symbols: [{ literal: '*' }] },
  { name: 'multOp$subexpression$2', symbols: [{ literal: '/' }] },
  {
    name: 'multOp',
    symbols: ['multOp$subexpression$2'],
    postprocess: (d) => {
      return addArrayLoc(
        {
          name: d[0][0].value,
        },
        d
      );
    },
  },
  {
    name: 'range',
    symbols: [
      { literal: 'range' },
      '_',
      { literal: '(' },
      '_',
      'rangeInner',
      '_',
      { literal: ')' },
    ],
    postprocess: (d) => {
      return addArrayLoc(
        {
          type: 'range',
          args: d[4],
        },
        d
      );
    },
  },
  {
    name: 'rangeInner',
    symbols: ['expression', 'rangeParcelSeparator', 'expression'],
    postprocess: ([start, _through, end]) => [start, end],
  },
  {
    name: 'rangeParcelSeparator$subexpression$1',
    symbols: [{ literal: 'through' }],
  },
  {
    name: 'rangeParcelSeparator$subexpression$1',
    symbols: [{ literal: '..' }],
  },
  {
    name: 'rangeParcelSeparator$subexpression$1',
    symbols: [{ literal: 'to' }],
  },
  {
    name: 'rangeParcelSeparator',
    symbols: ['_', 'rangeParcelSeparator$subexpression$1', '_'],
    postprocess: () => null,
  },
  {
    name: 'sequence',
    symbols: [{ literal: '[' }, '_', 'sequenceInner', '_', { literal: ']' }],
    postprocess: (d) => addArrayLoc(d[2], d),
  },
  {
    name: 'sequenceInner',
    symbols: ['expression', 'sequenceThrough', 'expression', 'sequenceBy'],
    postprocess: (d) => {
      const [start, _through, end, by] = d;

      const args = [start, end];
      if (by) {
        args.push(by);
      }

      return addArrayLoc({ type: 'sequence', args }, d);
    },
  },
  {
    name: 'sequenceBy$ebnf$1$subexpression$1',
    symbols: ['_', { literal: 'by' }, '_', 'expression'],
  },
  {
    name: 'sequenceBy$ebnf$1',
    symbols: ['sequenceBy$ebnf$1$subexpression$1'],
    postprocess: id,
  },
  {
    name: 'sequenceBy$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'sequenceBy',
    symbols: ['sequenceBy$ebnf$1'],
    postprocess: (d) => d[0]?.[3] ?? null,
  },
  {
    name: 'sequenceThrough$subexpression$1',
    symbols: [{ literal: 'through' }],
  },
  { name: 'sequenceThrough$subexpression$1', symbols: [{ literal: '..' }] },
  {
    name: 'sequenceThrough',
    symbols: ['_', 'sequenceThrough$subexpression$1', '_'],
    postprocess: () => null,
  },
  {
    name: 'importData',
    symbols: [
      { literal: 'import_data' },
      '__',
      tokenizer.has('string') ? { type: 'string' } : string,
    ],
    postprocess: (d) => {
      return addArrayLoc(
        {
          type: 'imported-data',
          args: [d[2].value],
        },
        d
      );
    },
  },
  {
    name: 'functionDef',
    symbols: [
      'functionDefName',
      '_',
      'functionDefArgs',
      '_',
      { literal: '=' },
      '_',
      'functionBody',
    ],
    postprocess: (d) =>
      addArrayLoc(
        {
          type: 'function-definition',
          args: [d[0], d[2], d[6]],
        },
        d
      ),
  },
  {
    name: 'functionDefName',
    symbols: ['identifier'],
    postprocess: (d) =>
      addLoc(
        {
          type: 'funcdef',
          args: [d[0].name],
        },
        d[0]
      ),
  },
  { name: 'functionDefArgs$ebnf$1', symbols: [] },
  {
    name: 'functionDefArgs$ebnf$1$subexpression$1',
    symbols: ['optionalComma', 'argName'],
  },
  {
    name: 'functionDefArgs$ebnf$1',
    symbols: [
      'functionDefArgs$ebnf$1',
      'functionDefArgs$ebnf$1$subexpression$1',
    ],
    postprocess: function arrpush(d) {
      return d[0].concat([d[1]]);
    },
  },
  {
    name: 'functionDefArgs$ebnf$2$subexpression$1',
    symbols: ['_', { literal: ',' }],
  },
  {
    name: 'functionDefArgs$ebnf$2',
    symbols: ['functionDefArgs$ebnf$2$subexpression$1'],
    postprocess: id,
  },
  {
    name: 'functionDefArgs$ebnf$2',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'functionDefArgs',
    symbols: [
      { literal: '(' },
      '_',
      'argName',
      'functionDefArgs$ebnf$1',
      'functionDefArgs$ebnf$2',
      '_',
      { literal: ')' },
    ],
    postprocess: (d) =>
      addArrayLoc(
        {
          type: 'argument-names',
          args: [d[2], ...d[3].map(([_comma, arg]) => arg)],
        },
        d
      ),
  },
  {
    name: 'optionalComma$subexpression$1',
    symbols: ['_', { literal: ',' }, '_'],
  },
  { name: 'optionalComma$subexpression$1', symbols: ['__'] },
  {
    name: 'optionalComma',
    symbols: ['optionalComma$subexpression$1'],
    postprocess: id,
  },
  {
    name: 'argName',
    symbols: ['identifier'],
    postprocess: (d) =>
      addLoc(
        {
          type: 'def',
          args: [d[0].name],
        },
        d[0]
      ),
  },
  {
    name: 'functionBody',
    symbols: ['expression'],
    postprocess: ([exp]) =>
      addLoc(
        {
          type: 'block',
          args: [exp],
        },
        exp
      ),
  },
  {
    name: 'functionCall',
    symbols: ['identifier', '_', 'callArgs'],
    postprocess: (d) => {
      const func = d[0];
      const args = d[2];

      return addArrayLoc(
        {
          type: 'function-call',
          args: [
            addLoc(
              {
                type: 'funcref',
                args: [func.name],
              },
              func
            ),
            addLoc(
              {
                type: 'argument-list',
                args: args.args,
              },
              args
            ),
          ],
        },
        d
      );
    },
  },
  { name: 'callArgs$ebnf$1', symbols: [] },
  {
    name: 'callArgs$ebnf$1$subexpression$1',
    symbols: ['_', { literal: ',' }, '_', 'expression'],
  },
  {
    name: 'callArgs$ebnf$1',
    symbols: ['callArgs$ebnf$1', 'callArgs$ebnf$1$subexpression$1'],
    postprocess: function arrpush(d) {
      return d[0].concat([d[1]]);
    },
  },
  { name: 'callArgs$ebnf$2$subexpression$1', symbols: ['_', { literal: ',' }] },
  {
    name: 'callArgs$ebnf$2',
    symbols: ['callArgs$ebnf$2$subexpression$1'],
    postprocess: id,
  },
  {
    name: 'callArgs$ebnf$2',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'callArgs',
    symbols: [
      { literal: '(' },
      '_',
      'expression',
      'callArgs$ebnf$1',
      'callArgs$ebnf$2',
      '_',
      { literal: ')' },
    ],
    postprocess: (d) =>
      addArrayLoc(
        {
          type: 'argument-list',
          args: [d[2], ...d[3].map(([_ws, _comma, _ws2, arg]) => arg)],
        },
        d
      ),
  },
  {
    name: 'block$ebnf$1$subexpression$1',
    symbols: [
      tokenizer.has('statementSep') ? { type: 'statementSep' } : statementSep,
    ],
  },
  {
    name: 'block$ebnf$1$subexpression$1',
    symbols: [tokenizer.has('ws') ? { type: 'ws' } : ws],
  },
  {
    name: 'block$ebnf$1',
    symbols: ['block$ebnf$1$subexpression$1'],
    postprocess: id,
  },
  {
    name: 'block$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  { name: 'block$ebnf$2', symbols: [] },
  {
    name: 'block$ebnf$2$subexpression$1',
    symbols: [
      tokenizer.has('statementSep') ? { type: 'statementSep' } : statementSep,
      'statement',
    ],
  },
  {
    name: 'block$ebnf$2',
    symbols: ['block$ebnf$2', 'block$ebnf$2$subexpression$1'],
    postprocess: function arrpush(d) {
      return d[0].concat([d[1]]);
    },
  },
  {
    name: 'block$ebnf$3$subexpression$1',
    symbols: [
      tokenizer.has('statementSep') ? { type: 'statementSep' } : statementSep,
    ],
  },
  {
    name: 'block$ebnf$3$subexpression$1',
    symbols: [tokenizer.has('ws') ? { type: 'ws' } : ws],
  },
  {
    name: 'block$ebnf$3',
    symbols: ['block$ebnf$3$subexpression$1'],
    postprocess: id,
  },
  {
    name: 'block$ebnf$3',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'block',
    symbols: ['block$ebnf$1', 'statement', 'block$ebnf$2', 'block$ebnf$3'],
    postprocess: (d) => {
      const stmt = d[1];
      const repetitions = d[2].map(([__n, stmt]) => stmt);

      return addArrayLoc(
        {
          type: 'block',
          args: [stmt, ...repetitions],
        },
        d
      );
    },
  },
  { name: 'statement', symbols: ['assign'], postprocess: id },
  { name: 'statement', symbols: ['functionDef'], postprocess: id },
  { name: 'statement', symbols: ['expression'], postprocess: id },
  {
    name: 'assign',
    symbols: ['identifier', '_', { literal: '=' }, '_', 'assignable'],
    postprocess: (d) =>
      addArrayLoc(
        {
          type: 'assign',
          args: [
            addLoc(
              {
                type: 'def',
                args: [d[0].name],
              },
              d[0]
            ),
            d[4],
          ],
        },
        d
      ),
  },
  { name: 'assignable', symbols: ['expression'], postprocess: id },
  { name: 'assignable', symbols: ['table'], postprocess: id },
  {
    name: 'identifier',
    symbols: [
      tokenizer.has('identifier') ? { type: 'identifier' } : identifier,
    ],
    postprocess: (d, _l, reject) => {
      const identString = d[0].value;

      if (isReservedWord(identString)) {
        return reject;
      } else {
        return addLoc({ name: identString }, d[0]);
      }
    },
  },
  {
    name: 'genericIdentifier',
    symbols: [
      tokenizer.has('identifier') ? { type: 'identifier' } : identifier,
    ],
    postprocess: (d) => {
      return addArrayLoc(
        {
          type: 'generic-identifier',
          args: [d[0].value],
        },
        d
      );
    },
  },
  {
    name: 'ref',
    symbols: ['identifier'],
    postprocess: (d, _l, reject) => {
      const name = d[0].name;
      if (reservedWords.has(name)) {
        return reject;
      } else {
        return addLoc({ type: 'ref', args: [name] }, d[0]);
      }
    },
  },
  {
    name: 'expression',
    symbols: [
      { literal: 'if' },
      '__',
      'expression',
      '__',
      { literal: 'then' },
      '__',
      'expression',
      '__',
      { literal: 'else' },
      '__',
      'expression',
    ],
    postprocess: (d) =>
      addArrayLoc(
        {
          type: 'function-call',
          args: [
            addLoc(
              {
                type: 'funcref',
                args: ['if'],
              },
              d[0]
            ),
            addArrayLoc(
              {
                type: 'argument-list',
                args: [d[2], d[6], d[10]],
              },
              d.slice(2)
            ),
          ],
        },
        d
      ),
  },
];
let ParserStart = 'block';
export default { Lexer, ParserRules, ParserStart };
