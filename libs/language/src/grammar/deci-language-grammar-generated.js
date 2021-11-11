// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) {
  return x[0];
}

import { tokenizer } from './tokenizer';

import Fraction from 'fraction.js';

function numberLiteralFromUnits(parentNode, n, units = null) {
  const mult =
    (!units && 1) ||
    units.args
      .map((unit) => unit.multiplier ** (unit.exp || 1))
      .reduce((acc, mult) => acc * mult, 1);

  const fraction = new Fraction(n, 1 / mult);

  const node = {
    type: 'literal',
    args: ['number', n, units, fraction],
  };
  if (Array.isArray(parentNode)) {
    return addArrayLoc(node, parentNode);
  }
  return addLoc(node, parentNode);
}

const abbreviatedPrefixes = {
  y: 'yocto',
  z: 'zepto',
  a: 'atto',
  f: 'femto',
  p: 'pico',
  n: 'nano',
  μ: 'micro',
  m: 'milli',
  c: 'centi',
  d: 'deci',
  da: 'deca',
  h: 'hecto',
  k: 'kilo',
  M: 'mega',
  G: 'giga',
  T: 'tera',
  P: 'peta',
  E: 'exa',
  Z: 'zetta',
  Y: 'yotta',
};

const multiplierPrefixes = {
  yocto: 1e-24,
  zepto: 1e-21,
  atto: 1e-18,
  femto: 1e-15,
  pico: 1e-12,
  nano: 1e-9,
  micro: 1e-6,
  milli: 1e-3,
  centi: 1e-2,
  deci: 1e-1,
  deca: 1e1,
  hecto: 1e2,
  kilo: 1e3,
  mega: 1e6,
  giga: 1e9,
  tera: 1e12,
  peta: 1e15,
  exa: 1e18,
  zetta: 1e21,
  yotta: 1e24,
};

const trimPrefix = (unitName) => {
  if (unitName.startsWith('da')) {
    return [multiplierPrefixes.deca, unitName.slice(2)];
  } else if (unitName[0] in abbreviatedPrefixes) {
    const prefix = abbreviatedPrefixes[unitName[0]];
    return [multiplierPrefixes[prefix], unitName.slice(1)];
  } else {
    for (const [prefix, multiplier] of Object.entries(multiplierPrefixes)) {
      if (unitName.startsWith(prefix)) {
        return [multiplier, unitName.slice(prefix.length)];
      }
    }
    return [1, unitName];
  }
};

const parseUnit = (unitString) => {
  if (knowsUnit(unitString)) {
    return {
      unit: unitString,
      exp: 1,
      multiplier: 1,
      known: true,
    };
  } else {
    let [multiplier, name] = trimPrefix(unitString);
    const known = knowsUnit(name);

    if (!known) {
      name = unitString;
      multiplier = 1;
    }

    return {
      unit: name,
      exp: 1,
      multiplier,
      known,
    };
  }
};

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
    const number = parseInt(text);
    if (
      text.length !== len ||
      Number.isNaN(number) ||
      number < min ||
      number > max
    ) {
      return reject;
    } else {
      return { [key]: number };
    }
  };

import { knowsUnit } from '../units';

const reservedWords = new Set([
  'in',
  'as',
  'where',
  'given',
  'per',
  'true',
  'false',
  'if',
  'then',
  'else',
  'through',
  'date',
  'function',
  'and',
  'not',
  'or',
  'with',
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
    name: '___',
    symbols: [tokenizer.has('ws') ? { type: 'ws' } : ws],
    postprocess: (d, _l, reject) => {
      if (d[0].value.includes('\n') || d[0].length === 0) {
        return reject;
      } else {
        return d[0];
      }
    },
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
  { name: 'literal', symbols: ['timeQuantity'], postprocess: id },
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
          args: ['boolean', true, null],
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
          args: ['boolean', false, null],
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
  { name: 'number$ebnf$1', symbols: ['___'], postprocess: id },
  {
    name: 'number$ebnf$1',
    symbols: [],
    postprocess: function (d) {
      return null;
    },
  },
  {
    name: 'number',
    symbols: ['unitlessNumber', 'number$ebnf$1', 'units'],
    postprocess: (d) => {
      const [n, _, units] = d;
      return numberLiteralFromUnits(d, n.n, units);
    },
  },
  {
    name: 'percentage',
    symbols: ['decimal', { literal: '%' }],
    postprocess: (d) => {
      return numberLiteralFromUnits(d, d[0].n / 100);
    },
  },
  {
    name: 'unitlessNumber',
    symbols: [tokenizer.has('number') ? { type: 'number' } : number],
    postprocess: ([number]) => {
      return addLoc(
        {
          n: parseFloat(number.value),
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
            n: parseInt(number.value),
          },
          number
        );
      }
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
            n: parseFloat(number.value),
          },
          number
        );
      }
    },
  },
  {
    name: 'units',
    symbols: ['unitBit'],
    postprocess: ([units]) =>
      addLoc(
        {
          type: 'units',
          args: units.units,
        },
        units
      ),
  },
  {
    name: 'unitBit',
    symbols: ['unit'],
    postprocess: ([u]) => addLoc({ units: [u] }, u),
  },
  {
    name: 'unitBit',
    symbols: ['unit', { literal: '*' }, 'unitBit'],
    postprocess: (d) =>
      addArrayLoc(
        {
          units: [d[0], ...d[2].units],
        },
        d
      ),
  },
  {
    name: 'unitBit',
    symbols: ['unit', { literal: '/' }, 'unitBit'],
    postprocess: (d) => {
      const [second, ...rest] = d[2].units;

      return addArrayLoc(
        {
          units: [d[0], { ...second, exp: -second.exp }, ...rest],
        },
        d
      );
    },
  },
  { name: 'unit', symbols: ['unitName'], postprocess: id },
  {
    name: 'unitName',
    symbols: [
      tokenizer.has('identifier') ? { type: 'identifier' } : identifier,
    ],
    postprocess: ([ident]) => addLoc(parseUnit(ident.value), ident),
  },
  {
    name: 'unit',
    symbols: ['unitName', { literal: '^' }, 'int'],
    postprocess: ([unit, _, exponent]) => {
      unit.exp *= exponent.n;
      return addLoc(unit, unit, exponent);
    },
  },
  {
    name: 'string',
    symbols: [tokenizer.has('string') ? { type: 'string' } : string],
    postprocess: ([string]) => {
      return addLoc(
        {
          type: 'literal',
          args: ['string', string.value, null],
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
    postprocess: returnMonth(1),
  },
  { name: 'literalMonth$subexpression$2', symbols: [{ literal: 'Feb' }] },
  { name: 'literalMonth$subexpression$2', symbols: [{ literal: 'February' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$2'],
    postprocess: returnMonth(2),
  },
  { name: 'literalMonth$subexpression$3', symbols: [{ literal: 'Mar' }] },
  { name: 'literalMonth$subexpression$3', symbols: [{ literal: 'March' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$3'],
    postprocess: returnMonth(3),
  },
  { name: 'literalMonth$subexpression$4', symbols: [{ literal: 'Apr' }] },
  { name: 'literalMonth$subexpression$4', symbols: [{ literal: 'April' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$4'],
    postprocess: returnMonth(4),
  },
  {
    name: 'literalMonth',
    symbols: [{ literal: 'May' }],
    postprocess: returnMonth(5),
  },
  { name: 'literalMonth$subexpression$5', symbols: [{ literal: 'Jun' }] },
  { name: 'literalMonth$subexpression$5', symbols: [{ literal: 'June' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$5'],
    postprocess: returnMonth(6),
  },
  { name: 'literalMonth$subexpression$6', symbols: [{ literal: 'Jul' }] },
  { name: 'literalMonth$subexpression$6', symbols: [{ literal: 'July' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$6'],
    postprocess: returnMonth(7),
  },
  { name: 'literalMonth$subexpression$7', symbols: [{ literal: 'Aug' }] },
  { name: 'literalMonth$subexpression$7', symbols: [{ literal: 'August' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$7'],
    postprocess: returnMonth(8),
  },
  { name: 'literalMonth$subexpression$8', symbols: [{ literal: 'Sep' }] },
  { name: 'literalMonth$subexpression$8', symbols: [{ literal: 'September' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$8'],
    postprocess: returnMonth(9),
  },
  { name: 'literalMonth$subexpression$9', symbols: [{ literal: 'Oct' }] },
  { name: 'literalMonth$subexpression$9', symbols: [{ literal: 'October' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$9'],
    postprocess: returnMonth(10),
  },
  { name: 'literalMonth$subexpression$10', symbols: [{ literal: 'Nov' }] },
  { name: 'literalMonth$subexpression$10', symbols: [{ literal: 'November' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$10'],
    postprocess: returnMonth(11),
  },
  { name: 'literalMonth$subexpression$11', symbols: [{ literal: 'Dec' }] },
  { name: 'literalMonth$subexpression$11', symbols: [{ literal: 'December' }] },
  {
    name: 'literalMonth',
    symbols: ['literalMonth$subexpression$11'],
    postprocess: returnMonth(12),
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
      let hours = parseInt(h.value);
      let minutes = m ? parseInt(m[1].value) : 0;

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
    name: 'columnItems',
    symbols: ['_', 'expression', 'columnItems$ebnf$1', '_'],
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
    name: 'given',
    symbols: [
      { literal: 'given' },
      '__',
      'ref',
      '_',
      { literal: ':' },
      '_',
      'givenBody',
    ],
    postprocess: (d) => {
      return addArrayLoc(
        {
          type: 'given',
          args: [d[2], d[6]],
        },
        d
      );
    },
  },
  { name: 'givenBody', symbols: ['table'], postprocess: id },
  { name: 'givenBody', symbols: ['expression'], postprocess: id },
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
  { name: 'tableSep$subexpression$1', symbols: ['__n'] },
  { name: 'tableSep$subexpression$1', symbols: ['_', { literal: ',' }, '_'] },
  { name: 'tableSep', symbols: ['tableSep$subexpression$1'], postprocess: id },
  { name: 'expression', symbols: ['nonGivenExp'], postprocess: id },
  { name: 'expression', symbols: ['given'], postprocess: id },
  { name: 'expression', symbols: ['asExp'], postprocess: id },
  { name: 'nonGivenExp', symbols: ['divMulOp'], postprocess: id },
  { name: 'nonGivenExp', symbols: ['importData'], postprocess: id },
  {
    name: 'asExp',
    symbols: ['expression', '_', { literal: 'as' }, '_', 'units'],
    postprocess: (d, _l, reject) => {
      const exp = d[0];
      const unit = d[4];

      return addArrayLoc(
        {
          type: 'as',
          args: [exp, unit],
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
  { name: 'addSubOp', symbols: ['primary'], postprocess: id },
  {
    name: 'addSubOp',
    symbols: ['addSubOp', '_', 'multiplicativeOperator', '_', 'primary'],
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
  { name: 'primary', symbols: ['functionCall'], postprocess: id },
  { name: 'primary', symbols: ['literal'], postprocess: id },
  { name: 'primary', symbols: ['ref'], postprocess: id },
  { name: 'primary', symbols: ['parenthesizedExpression'], postprocess: id },
  {
    name: 'primary',
    symbols: [{ literal: '-' }, '_', 'expression'],
    postprocess: (d) => {
      const expr = d[2];
      if (expr.type === 'literal' && expr.args[0] === 'number') {
        expr.args[1] = -expr.args[1];
        expr.args[3] = !expr.args[3] || expr.args[3].neg();
        return addArrayLoc(
          {
            type: expr.type,
            args: expr.args,
          },
          d
        );
      } else {
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
      }
    },
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
  { name: 'primary$subexpression$2', symbols: ['ref'] },
  { name: 'primary$subexpression$2', symbols: ['functionCall'] },
  { name: 'primary$subexpression$2', symbols: ['parenthesizedExpression'] },
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
  {
    name: 'multiplicativeOperator$subexpression$1',
    symbols: [{ literal: '**' }],
  },
  {
    name: 'multiplicativeOperator$subexpression$1',
    symbols: [{ literal: '>' }],
  },
  {
    name: 'multiplicativeOperator$subexpression$1',
    symbols: [{ literal: '<' }],
  },
  {
    name: 'multiplicativeOperator$subexpression$1',
    symbols: [{ literal: '<=' }],
  },
  {
    name: 'multiplicativeOperator$subexpression$1',
    symbols: [{ literal: '>=' }],
  },
  {
    name: 'multiplicativeOperator$subexpression$1',
    symbols: [{ literal: '==' }],
  },
  {
    name: 'multiplicativeOperator$subexpression$1',
    symbols: [{ literal: '!=' }],
  },
  {
    name: 'multiplicativeOperator$subexpression$1',
    symbols: [{ literal: 'contains' }],
  },
  {
    name: 'multiplicativeOperator',
    symbols: ['multiplicativeOperator$subexpression$1'],
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
    name: 'multiplicativeOperator$subexpression$2',
    symbols: [{ literal: '*' }],
  },
  {
    name: 'multiplicativeOperator$subexpression$2',
    symbols: [{ literal: '/' }],
  },
  {
    name: 'multiplicativeOperator$subexpression$2',
    symbols: [{ literal: '%' }],
  },
  {
    name: 'multiplicativeOperator$subexpression$2',
    symbols: [{ literal: '^' }],
  },
  {
    name: 'multiplicativeOperator',
    symbols: [
      { literal: ' ' },
      'multiplicativeOperator$subexpression$2',
      { literal: ' ' },
    ],
    postprocess: (d) => {
      return addArrayLoc(
        {
          name: d[1][0].value,
        },
        d
      );
    },
  },
  { name: 'timeQuantity$ebnf$1', symbols: [] },
  {
    name: 'timeQuantity$ebnf$1$subexpression$1',
    symbols: ['timeQuantityDefParcelSeparator', 'timeQuantityDefParcel'],
  },
  {
    name: 'timeQuantity$ebnf$1',
    symbols: ['timeQuantity$ebnf$1', 'timeQuantity$ebnf$1$subexpression$1'],
    postprocess: function arrpush(d) {
      return d[0].concat([d[1]]);
    },
  },
  {
    name: 'timeQuantity',
    symbols: [
      { literal: '[' },
      '_',
      'timeQuantityDefParcel',
      'timeQuantity$ebnf$1',
      '_',
      { literal: ']' },
    ],
    postprocess: (d) => {
      const parcel = d[2];
      const moreParcels = (d[3] || []).flatMap(([_ws, parcel]) => parcel);

      return addArrayLoc(
        {
          type: 'time-quantity',
          args: [...parcel, ...moreParcels],
        },
        d
      );
    },
  },
  {
    name: 'timeQuantityDefParcel',
    symbols: ['int', '__', 'timeQuantityUnit'],
    postprocess: ([quantity, _ws, unit]) => [unit, quantity.n],
  },
  {
    name: 'timeQuantityUnit',
    symbols: ['identifier'],
    postprocess: ([unitIdent], _l, reject) => {
      const unit = unitIdent.name.replace(/s$/, '');

      if (timeUnitStrings.has(unit)) {
        return unit;
      } else {
        return reject;
      }
    },
  },
  {
    name: 'timeQuantityDefParcelSeparator$subexpression$1$subexpression$1',
    symbols: ['_', { literal: ',' }, '_'],
  },
  {
    name: 'timeQuantityDefParcelSeparator$subexpression$1',
    symbols: ['timeQuantityDefParcelSeparator$subexpression$1$subexpression$1'],
  },
  {
    name: 'timeQuantityDefParcelSeparator$subexpression$1$subexpression$2',
    symbols: ['__', { literal: 'and' }, '__'],
  },
  {
    name: 'timeQuantityDefParcelSeparator$subexpression$1',
    symbols: ['timeQuantityDefParcelSeparator$subexpression$1$subexpression$2'],
  },
  {
    name: 'timeQuantityDefParcelSeparator$subexpression$1$subexpression$3',
    symbols: ['_', { literal: ',' }, '_', { literal: 'and' }, '__'],
  },
  {
    name: 'timeQuantityDefParcelSeparator$subexpression$1',
    symbols: ['timeQuantityDefParcelSeparator$subexpression$1$subexpression$3'],
  },
  {
    name: 'timeQuantityDefParcelSeparator',
    symbols: ['timeQuantityDefParcelSeparator$subexpression$1'],
    postprocess: id,
  },
  {
    name: 'range',
    symbols: [{ literal: '[' }, '_', 'rangeSpec', '_', { literal: ']' }],
    postprocess: (d) => {
      const range = d[2];
      return addArrayLoc(range, d);
    },
  },
  {
    name: 'rangeSpec',
    symbols: ['expression', 'rangeParcelSeparator', 'expression'],
    postprocess: (d) => {
      return addArrayLoc(
        {
          type: 'range',
          args: [d[0], d[2]],
        },
        d
      );
    },
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
    symbols: ['rangeSpec', '_', { literal: 'by' }, '_', 'expression'],
    postprocess: (d) => {
      const range = d[0];
      return {
        type: 'sequence',
        args: [range.args[0], range.args[1], d[4]],
      };
    },
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
      { literal: 'function' },
      '___',
      'functionDefName',
      '_',
      'functionDefArgs',
      '_',
      { literal: '=>' },
      '_',
      'functionBody',
    ],
    postprocess: (d) =>
      addArrayLoc(
        {
          type: 'function-definition',
          args: [d[2], d[4], d[8]],
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
    name: 'functionDefArgs',
    symbols: [
      { literal: '(' },
      '_',
      'argName',
      'functionDefArgs$ebnf$1',
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
  {
    name: 'callArgs',
    symbols: [
      { literal: '(' },
      '_',
      'expression',
      'callArgs$ebnf$1',
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
  { name: 'block$ebnf$1', symbols: [] },
  { name: 'block$ebnf$1$subexpression$1', symbols: ['__n', 'statement'] },
  {
    name: 'block$ebnf$1',
    symbols: ['block$ebnf$1', 'block$ebnf$1$subexpression$1'],
    postprocess: function arrpush(d) {
      return d[0].concat([d[1]]);
    },
  },
  {
    name: 'block',
    symbols: ['_', 'statement', 'block$ebnf$1', '_'],
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
