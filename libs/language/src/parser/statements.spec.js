import { runTests } from './run-tests';

runTests({
  'one statement per line': {
    source: 'RefName1 = 1\nRefName2 = 2',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['RefName1'],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 7,
              line: 1,
              column: 8,
            },
          },
          {
            type: 'literal',
            args: ['number', 1, null],
            start: {
              char: 11,
              line: 1,
              column: 12,
            },
            end: {
              char: 11,
              line: 1,
              column: 12,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 11,
          line: 1,
          column: 12,
        },
      },
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['RefName2'],
            start: {
              char: 13,
              line: 2,
              column: 1,
            },
            end: {
              char: 20,
              line: 2,
              column: 8,
            },
          },
          {
            type: 'literal',
            args: ['number', 2, null],
            start: {
              char: 24,
              line: 2,
              column: 12,
            },
            end: {
              char: 24,
              line: 2,
              column: 12,
            },
          },
        ],
        start: {
          char: 13,
          line: 2,
          column: 1,
        },
        end: {
          char: 24,
          line: 2,
          column: 12,
        },
      },
    ],
  },

  'one statement spans multiple lines': {
    source: 'RefName1\n=\n1\nRefName2\n=\n2',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['RefName1'],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 7,
              line: 1,
              column: 8,
            },
          },
          {
            type: 'literal',
            args: ['number', 1, null],
            start: {
              char: 11,
              line: 3,
              column: 1,
            },
            end: {
              char: 11,
              line: 3,
              column: 1,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 11,
          line: 3,
          column: 1,
        },
      },
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['RefName2'],
            start: {
              char: 13,
              line: 4,
              column: 1,
            },
            end: {
              char: 20,
              line: 4,
              column: 8,
            },
          },
          {
            type: 'literal',
            args: ['number', 2, null],
            start: {
              char: 24,
              line: 6,
              column: 1,
            },
            end: {
              char: 24,
              line: 6,
              column: 1,
            },
          },
        ],
        start: {
          char: 13,
          line: 4,
          column: 1,
        },
        end: {
          char: 24,
          line: 6,
          column: 1,
        },
      },
    ],
  },
});
