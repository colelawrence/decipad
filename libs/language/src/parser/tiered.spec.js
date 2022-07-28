import { F } from '../utils';
import { runTests } from './run-tests';

runTests({
  'empty tiered': {
    source: ' tiered x { } ',
    ast: [
      {
        type: 'tiered',
        args: [
          {
            args: ['x'],
            type: 'ref',
          },
        ],
      },
    ],
  },
  'tiered with layers': {
    source: ` tiered x {
      def1: 1
      def2: 2
      def3: 3
    } `,
    ast: [
      {
        type: 'tiered',
        args: [
          {
            type: 'ref',
            args: ['x'],
          },
          {
            type: 'tiered-def',
            args: [
              {
                type: 'ref',
                args: ['def1'],
              },
              {
                type: 'literal',
                args: ['number', F(1)],
              },
            ],
          },
          {
            args: [
              {
                type: 'ref',
                args: ['def2'],
              },
              {
                type: 'literal',
                args: ['number', F(2)],
              },
            ],
            type: 'tiered-def',
          },
          {
            type: 'tiered-def',
            args: [
              {
                type: 'ref',
                args: ['def3'],
              },
              {
                type: 'literal',
                args: ['number', F(3)],
              },
            ],
          },
        ],
      },
    ],
  },
});
