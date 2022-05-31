import { c, F, l, r } from '../utils';
import { runTests } from './run-tests';

runTests({
  'expression is number literal': {
    source: ' -41 ',
    ast: [
      {
        type: 'literal',
        args: ['number', F(41).neg()],
        start: {
          char: 1,
          column: 2,
          line: 1,
        },
        end: {
          char: 3,
          column: 4,
          line: 1,
        },
      },
    ],
  },

  'expression is decimal literal': {
    source: '\n\n  -41.5 ',
    ast: [
      {
        type: 'literal',
        args: ['number', F(415, 10).neg()],
        start: {
          char: 4,
          column: 3,
          line: 3,
        },
        end: {
          char: 8,
          column: 7,
          line: 3,
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

  'expression is percentage literal': {
    source: '10.5%',
    ast: [
      {
        type: 'literal',
        args: ['number', F(105, 1000)],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 4,
          line: 1,
          column: 5,
        },
      },
    ],
  },

  'expression is negated number with units': {
    source: '-10 days',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['implicit*'],
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', F(10).neg()],
              },
              {
                type: 'ref',
                args: ['days'],
              },
            ],
          },
        ],
      },
    ],
  },

  'implicit multiplication': {
    source: 'banana meter',
    ast: [c('implicit*', r('banana'), r('meter'))],
  },

  'indirect implicit multiplication': {
    source: '10 banana meter',
    ast: [c('implicit*', c('implicit*', l(10), r('banana')), r('meter'))],
  },
});
