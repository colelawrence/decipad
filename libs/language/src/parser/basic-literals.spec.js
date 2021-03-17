import { runTests } from './run-tests';

runTests({
  'expression is number literal': {
    source: ' -41 ',
    ast: [
      {
        type: 'literal',
        args: ['number', -41, null],
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
        args: ['number', -41.5, null],
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

  'expression is exp literal': {
    source: ' -21.3e4 ',
    ast: [
      {
        type: 'literal',
        args: ['number', -213000, null],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 7,
          line: 1,
          column: 8,
        },
      },
    ],
  },

  'expression is character literal': {
    source: " 'B' ",
    ast: [
      {
        type: 'literal',
        args: ['char', 'B'],
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

  'invalid character syntax': {
    source: " 'BB' ",
    expectError: 'Syntax error at line 1 col 4',
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
