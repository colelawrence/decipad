import { runTests } from './run-tests';

runTests({
  'property accessor': {
    source: ' abc.def',
    ast: [
      {
        type: 'property-access',
        args: [
          {
            type: 'ref',
            args: ['abc'],
            location: 1,
            length: 3,
          },
          'def',
        ],
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

  'has highest precedence': {
    source: 'a + b.c * d',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['+'],
            start: {
              char: 2,
              line: 1,
              column: 3,
            },
            end: {
              char: 2,
              line: 1,
              column: 3,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'ref',
                args: ['a'],
                start: {
                  char: 0,
                  line: 1,
                  column: 1,
                },
                end: {
                  char: 0,
                  line: 1,
                  column: 1,
                },
              },
              {
                type: 'function-call',
                args: [
                  {
                    type: 'funcref',
                    args: ['*'],
                    start: {
                      char: 7,
                      line: 1,
                      column: 8,
                    },
                    end: {
                      char: 9,
                      line: 1,
                      column: 10,
                    },
                  },
                  {
                    type: 'argument-list',
                    args: [
                      {
                        type: 'property-access',
                        args: [
                          {
                            type: 'ref',
                            args: ['b'],
                            location: 4,
                            length: 1,
                          },
                          'c',
                        ],
                        start: {
                          char: 4,
                          line: 1,
                          column: 5,
                        },
                        end: {
                          char: 6,
                          line: 1,
                          column: 7,
                        },
                      },
                      {
                        type: 'ref',
                        args: ['d'],
                        start: {
                          char: 10,
                          line: 1,
                          column: 11,
                        },
                        end: {
                          char: 10,
                          line: 1,
                          column: 11,
                        },
                      },
                    ],
                    start: {
                      char: 4,
                      line: 1,
                      column: 5,
                    },
                    end: {
                      char: 10,
                      line: 1,
                      column: 11,
                    },
                  },
                ],
                start: {
                  char: 4,
                  line: 1,
                  column: 5,
                },
                end: {
                  char: 10,
                  line: 1,
                  column: 11,
                },
              },
            ],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 10,
              line: 1,
              column: 11,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 10,
          line: 1,
          column: 11,
        },
      },
    ],
  },
});
