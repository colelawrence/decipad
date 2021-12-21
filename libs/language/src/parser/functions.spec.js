import { F } from '../utils';
import { runTests } from './run-tests';

runTests({
  'function definition with simple name': {
    source: 'FunctionName (arg1 arg2) = Ref1',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['FunctionName'],
            start: 0,
            end: 11,
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['arg1'],
                start: 14,
                end: 17,
              },
              {
                type: 'def',
                args: ['arg2'],
                start: 19,
                end: 22,
              },
            ],
            start: 13,
            end: 23,
          },
          {
            type: 'block',
            args: [
              {
                type: 'ref',
                args: ['Ref1'],
                start: 27,
                end: 30,
              },
            ],
            start: 27,
            end: 30,
          },
        ],
        start: 0,
        end: 30,
      },
    ],
  },

  'function definition': {
    source: 'name (arg1 arg2) = Ref1',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['name'],
            start: 0,
            end: 3,
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['arg1'],
                start: 6,
                end: 9,
              },
              {
                type: 'def',
                args: ['arg2'],
                start: 11,
                end: 14,
              },
            ],
            start: 5,
            end: 15,
          },
          {
            type: 'block',
            args: [
              {
                type: 'ref',
                args: ['Ref1'],
                start: 19,
                end: 22,
              },
            ],
            start: 19,
            end: 22,
          },
        ],
        start: 0,
        end: 22,
      },
    ],
  },

  'function definition with commas': {
    source: 'name (arg1, arg2,) = Ref1',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['name'],
            start: 0,
            end: 3,
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['arg1'],
                start: 6,
                end: 9,
              },
              {
                type: 'def',
                args: ['arg2'],
                start: 12,
                end: 15,
              },
            ],
            start: 5,
            end: 17,
          },
          {
            type: 'block',
            args: [
              {
                type: 'ref',
                args: ['Ref1'],
                start: 21,
                end: 24,
              },
            ],
            start: 21,
            end: 24,
          },
        ],
        start: 0,
        end: 24,
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
                args: ['number', F(1), null],
                start: 13,
                end: 13,
              },
              {
                type: 'literal',
                args: ['number', F(2), null],
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
                args: ['number', F(1), null],
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
    source: 'name(a b) = a + b\n\nfunctionname(1, 2)',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['name'],
            start: 0,
            end: 3,
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['a'],
                start: 5,
                end: 5,
              },
              {
                type: 'def',
                args: ['b'],
                start: 7,
                end: 7,
              },
            ],
            start: 4,
            end: 8,
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
                      char: 14,
                      line: 1,
                      column: 15,
                    },
                    end: {
                      char: 14,
                      line: 1,
                      column: 15,
                    },
                  },
                  {
                    type: 'argument-list',
                    args: [
                      {
                        type: 'ref',
                        args: ['a'],
                        start: {
                          char: 12,
                          line: 1,
                          column: 13,
                        },
                        end: {
                          char: 12,
                          line: 1,
                          column: 13,
                        },
                      },
                      {
                        type: 'ref',
                        args: ['b'],
                        start: {
                          char: 16,
                          line: 1,
                          column: 17,
                        },
                        end: {
                          char: 16,
                          line: 1,
                          column: 17,
                        },
                      },
                    ],
                    start: {
                      char: 12,
                      line: 1,
                      column: 13,
                    },
                    end: {
                      char: 16,
                      line: 1,
                      column: 17,
                    },
                  },
                ],
                start: {
                  char: 12,
                  line: 1,
                  column: 13,
                },
                end: {
                  char: 16,
                  line: 1,
                  column: 17,
                },
              },
            ],
            start: {
              char: 12,
              line: 1,
              column: 13,
            },
            end: {
              char: 16,
              line: 1,
              column: 17,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 16,
          line: 1,
          column: 17,
        },
      },
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['functionname'],
            start: {
              char: 19,
              line: 3,
              column: 1,
            },
            end: {
              char: 30,
              line: 3,
              column: 12,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', F(1), null],
                start: {
                  char: 32,
                  line: 3,
                  column: 14,
                },
                end: {
                  char: 32,
                  line: 3,
                  column: 14,
                },
              },
              {
                type: 'literal',
                args: ['number', F(2), null],
                start: 35,
                end: 35,
              },
            ],
            start: 31,
            end: 36,
          },
        ],
        start: {
          char: 19,
          line: 3,
          column: 1,
        },
        end: {
          char: 36,
          line: 3,
          column: 18,
        },
      },
    ],
  },
});
