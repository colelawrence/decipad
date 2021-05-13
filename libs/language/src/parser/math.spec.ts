import { runTests } from './run-tests';

runTests({
  'binops are left-associative': {
    source: 'A / B / C',
    sourceMap: false,
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['/'],
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'function-call',
                args: [
                  {
                    type: 'funcref',
                    args: ['/'],
                  },
                  {
                    type: 'argument-list',
                    args: [
                      {
                        type: 'ref',
                        args: ['A'],
                      },
                      {
                        type: 'ref',
                        args: ['B'],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'ref',
                args: ['C'],
              },
            ],
          },
        ],
      },
    ],
  },
});
