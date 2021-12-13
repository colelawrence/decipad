import { F } from '../utils';
import { runTests } from './run-tests';

runTests({
  'expression is number literal': {
    source: ' -41 ',
    ast: [
      {
        type: 'literal',
        args: ['number', F(-41), null],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 3,
          line: 1,
          column: 4,
        },
      },
    ],
  },

  'expression is decimal literal': {
    source: '\n\n  -41.5 ',
    ast: [
      {
        type: 'literal',
        args: ['number', F(-415, 10), null],
        start: {
          char: 4,
          line: 3,
          column: 3,
        },
        end: {
          char: 8,
          line: 3,
          column: 7,
        },
      },
    ],
  },

  'expression is boolean literal true': {
    source: ' true ',
    ast: [
      {
        type: 'literal',
        args: ['boolean', true],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 4,
          line: 1,
          column: 5,
        },
      },
    ],
  },

  'expression is string': {
    source: String.raw` "Hello\nWorld!" `,
    ast: [
      {
        type: 'literal',
        args: ['string', 'Hello\nWorld!'],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 15,
          line: 1,
          column: 16,
        },
      },
    ],
  },

  'expression is boolean literal false': {
    source: ' false ',
    ast: [
      {
        type: 'literal',
        args: ['boolean', false],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 5,
          line: 1,
          column: 6,
        },
      },
    ],
  },
});
