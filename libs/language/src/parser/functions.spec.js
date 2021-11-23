import { runTests } from './run-tests';

runTests({
  'function definition with simple name': {
    source: 'function FunctionName (arg1 arg2) => Ref1',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['FunctionName'],
            start: 9,
            end: 20,
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['arg1'],
                start: 23,
                end: 26,
              },
              {
                type: 'def',
                args: ['arg2'],
                start: 28,
                end: 31,
              },
            ],
            start: 22,
            end: 32,
          },
          {
            type: 'block',
            args: [
              {
                type: 'ref',
                args: ['Ref1'],
                start: 37,
                end: 40,
              },
            ],
            start: 37,
            end: 40,
          },
        ],
        start: 0,
        end: 40,
      },
    ],
  },

  'function definition': {
    source: 'function name (arg1 arg2) => Ref1',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['name'],
            start: 9,
            end: 12,
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['arg1'],
                start: 15,
                end: 18,
              },
              {
                type: 'def',
                args: ['arg2'],
                start: 20,
                end: 23,
              },
            ],
            start: 14,
            end: 24,
          },
          {
            type: 'block',
            args: [
              {
                type: 'ref',
                args: ['Ref1'],
                start: 29,
                end: 32,
              },
            ],
            start: 29,
            end: 32,
          },
        ],
        start: 0,
        end: 32,
      },
    ],
  },

  'function definition with commas': {
    source: 'function name (arg1, arg2,) => Ref1',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['name'],
            start: 9,
            end: 12,
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['arg1'],
                start: 15,
                end: 18,
              },
              {
                type: 'def',
                args: ['arg2'],
                start: 21,
                end: 24,
              },
            ],
            start: 14,
            end: 26,
          },
          {
            type: 'block',
            args: [
              {
                type: 'ref',
                args: ['Ref1'],
                start: 31,
                end: 34,
              },
            ],
            start: 31,
            end: 34,
          },
        ],
        start: 0,
        end: 34,
      },
    ],
  },

  'function call': {
    source: 'functionname(1, 2)',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['functionname'],
            start: 0,
            end: 11,
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', 1, null, { d: 1, n: 1, s: 1 }],
                start: 13,
                end: 13,
              },
              {
                type: 'literal',
                args: ['number', 2, null, { d: 1, n: 2, s: 1 }],
                start: 16,
                end: 16,
              },
            ],
            start: 12,
            end: 17,
          },
        ],
        start: 0,
        end: 17,
      },
    ],
  },

  'function call with trailing comma': {
    source: 'functionname(1,)',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['functionname'],
            start: 0,
            end: 11,
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', 1, null, { d: 1, n: 1, s: 1 }],
                start: 13,
                end: 13,
              },
            ],
            start: 12,
            end: 15,
          },
        ],
        start: 0,
        end: 15,
      },
    ],
  },
  'function declaration and use': {
    source: 'function name(a b) => a + b\n\nfunctionname(1, 2)',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['name'],
            start: 9,
            end: 12,
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['a'],
                start: 14,
                end: 14,
              },
              {
                type: 'def',
                args: ['b'],
                start: 16,
                end: 16,
              },
            ],
            start: 13,
            end: 17,
          },
          {
            type: 'block',
            args: [
              {
                type: 'function-call',
                args: [
                  {
                    type: 'funcref',
                    args: ['+'],
                    start: {
                      char: 24,
                      line: 1,
                      column: 25,
                    },
                    end: {
                      char: 24,
                      line: 1,
                      column: 25,
                    },
                  },
                  {
                    type: 'argument-list',
                    args: [
                      {
                        type: 'ref',
                        args: ['a'],
                        start: {
                          char: 22,
                          line: 1,
                          column: 23,
                        },
                        end: {
                          char: 22,
                          line: 1,
                          column: 23,
                        },
                      },
                      {
                        type: 'ref',
                        args: ['b'],
                        start: {
                          char: 26,
                          line: 1,
                          column: 27,
                        },
                        end: {
                          char: 26,
                          line: 1,
                          column: 27,
                        },
                      },
                    ],
                    start: {
                      char: 22,
                      line: 1,
                      column: 23,
                    },
                    end: {
                      char: 26,
                      line: 1,
                      column: 27,
                    },
                  },
                ],
                start: {
                  char: 22,
                  line: 1,
                  column: 23,
                },
                end: {
                  char: 26,
                  line: 1,
                  column: 27,
                },
              },
            ],
            start: {
              char: 22,
              line: 1,
              column: 23,
            },
            end: {
              char: 26,
              line: 1,
              column: 27,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 26,
          line: 1,
          column: 27,
        },
      },
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['functionname'],
            start: {
              char: 29,
              line: 3,
              column: 1,
            },
            end: {
              char: 40,
              line: 3,
              column: 12,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', 1, null, { d: 1, n: 1, s: 1 }],
                start: {
                  char: 42,
                  line: 3,
                  column: 14,
                },
                end: {
                  char: 42,
                  line: 3,
                  column: 14,
                },
              },
              {
                type: 'literal',
                args: ['number', 2, null, { d: 1, n: 2, s: 1 }],
                start: 45,
                end: 45,
              },
            ],
            start: 41,
            end: 46,
          },
        ],
        start: {
          char: 29,
          line: 3,
          column: 1,
        },
        end: {
          char: 46,
          line: 3,
          column: 18,
        },
      },
    ],
  },
});
