import { F } from '../../utils';
import { runTests } from '../run-tests';

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
            args: ['number', F(1)],
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
            args: ['number', F(2)],
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
    source: 'RefName1 =(\n1)\nRefName2 =(\n2)',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['RefName1'],
            start: 0,
            end: 7,
          },
          {
            type: 'literal',
            args: ['number', F(1)],
            start: 10,
            end: 13,
          },
        ],
        start: 0,
        end: 13,
      },
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['RefName2'],
            start: 15,
            end: 22,
          },
          {
            type: 'literal',
            args: ['number', F(2)],
            start: 25,
            end: 28,
          },
        ],
        start: 15,
        end: 28,
      },
    ],
  },
});
