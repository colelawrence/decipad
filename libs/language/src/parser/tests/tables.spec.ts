import { n } from '..';
import { col } from '../../utils';
import { runTests } from '../run-tests';

runTests({
  'empty table': {
    source: ' Table = { } ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [],
            start: {
              char: 9,
              line: 1,
              column: 10,
            },
            end: {
              char: 11,
              line: 1,
              column: 12,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 11,
          line: 1,
          column: 12,
        },
      },
    ],
  },

  'table with one implicit coldef': {
    source: ' Table = { abc } ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [
              {
                type: 'table-column',
                args: [
                  {
                    type: 'coldef',
                    args: ['abc'],
                    start: {
                      char: 11,
                      line: 1,
                      column: 12,
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                  },
                  {
                    type: 'ref',
                    args: ['abc'],
                    start: {
                      char: 11,
                      line: 1,
                      column: 12,
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                  },
                ],
                start: {
                  char: 11,
                  line: 1,
                  column: 12,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
            ],
            start: {
              char: 9,
              line: 1,
              column: 10,
            },
            end: {
              char: 15,
              line: 1,
              column: 16,
            },
          },
        ],
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

  /*
  'table with trailing comma': {
    source: ' Table = { abc, } ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [
              {
                type: 'table-column',
                args: [
                  {
                    type: 'coldef',
                    args: ['abc'],
                    start: {
                      char: 11,
                      line: 1,
                      column: 12,
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                  },
                  {
                    type: 'ref',
                    args: ['abc'],
                    start: {
                      char: 11,
                      line: 1,
                      column: 12,
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                  },
                ],
                start: {
                  char: 11,
                  line: 1,
                  column: 12,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
            ],
            start: {
              char: 9,
              line: 1,
              column: 10,
            },
            end: {
              char: 16,
              line: 1,
              column: 17,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 16,
          line: 1,
          column: 17,
        },
      },
    ],
  },
  */

  'table with three implicit coldefs': {
    source: ' Table = { abc  ,  def,   ghi} ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [
              {
                type: 'table-column',
                args: [
                  {
                    type: 'coldef',
                    args: ['abc'],
                    start: {
                      char: 11,
                      line: 1,
                      column: 12,
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                  },
                  {
                    type: 'ref',
                    args: ['abc'],
                    start: {
                      char: 11,
                      line: 1,
                      column: 12,
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                  },
                ],
                start: 11,
                end: 13,
              },
              {
                type: 'table-column',
                args: [
                  {
                    type: 'coldef',
                    args: ['def'],
                    start: {
                      char: 19,
                      line: 1,
                      column: 20,
                    },
                    end: {
                      char: 21,
                      line: 1,
                      column: 22,
                    },
                  },
                  {
                    type: 'ref',
                    args: ['def'],
                    start: {
                      char: 19,
                      line: 1,
                      column: 20,
                    },
                    end: {
                      char: 21,
                      line: 1,
                      column: 22,
                    },
                  },
                ],
                start: 19,
                end: 21,
              },
              {
                type: 'table-column',
                args: [
                  {
                    type: 'coldef',
                    args: ['ghi'],
                    start: {
                      char: 26,
                      line: 1,
                      column: 27,
                    },
                    end: {
                      char: 28,
                      line: 1,
                      column: 29,
                    },
                  },
                  {
                    type: 'ref',
                    args: ['ghi'],
                    start: {
                      char: 26,
                      line: 1,
                      column: 27,
                    },
                    end: {
                      char: 28,
                      line: 1,
                      column: 29,
                    },
                  },
                ],
                start: 26,
                end: 28,
              },
            ],
            start: {
              char: 9,
              line: 1,
              column: 10,
            },
            end: {
              char: 29,
              line: 1,
              column: 30,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 29,
          line: 1,
          column: 30,
        },
      },
    ],
  },

  'table with three implicit coldefs newline separated': {
    source: ' Table = { abc \n  def    \n   ghi \n } ',
    sourceMap: false,
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
          },
          {
            type: 'table',
            args: [
              {
                type: 'table-column',
                args: [n('coldef', 'abc'), n('ref', 'abc')],
              },
              {
                type: 'table-column',
                args: [n('coldef', 'def'), n('ref', 'def')],
              },
              {
                type: 'table-column',
                args: [n('coldef', 'ghi'), n('ref', 'ghi')],
              },
            ],
          },
        ],
      },
    ],
  },

  /*
  'table with explicit value as column': {
    source: ' Table = { abc = [ 1 , 2 ]  }',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
            start: 1,
            end: 5,
          },
          {
            type: 'table',
            args: [
              {
                type: 'table-column',
                args: [
                  {
                    type: 'coldef',
                    args: ['abc'],
                    start: 11,
                    end: 13,
                  },
                  {
                    type: 'column',
                    args: [
                      [
                        {
                          type: 'literal',
                          args: ['number', 1, null, { d: 1, n: 1, s: 1 }],
                          start: 19,
                          end: 19,
                        },
                        {
                          type: 'literal',
                          args: ['number', 2, null, { d: 1, n: 2, s: 1 }],
                          start: 23,
                          end: 23,
                        },
                      ],
                    ],
                    start: 17,
                    end: 25,
                  },
                ],
                start: 11,
                end: 25,
              },
            ],
            start: 9,
            end: 28,
          },
        ],
        start: 1,
        end: 28,
      },
    ],
  },
  */

  'table with mixed defs in each line': {
    source: ' Table = { \n abc \n def = [ 1 , 2 ] \n  }',
    sourceMap: false,
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
          },
          {
            type: 'table',
            args: [
              n('table-column', n('coldef', 'abc'), n('ref', 'abc')),
              n('table-column', n('coldef', 'def'), col(1, 2)),
            ],
          },
        ],
      },
    ],
  },

  'table with spreads': {
    source: ' Table = {...A } ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [
              {
                type: 'table-spread',
                args: [
                  {
                    type: 'ref',
                    args: ['A'],
                    start: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                  },
                ],
                start: {
                  char: 10,
                  line: 1,
                  column: 11,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
            ],
            start: {
              char: 9,
              line: 1,
              column: 10,
            },
            end: {
              char: 15,
              line: 1,
              column: 16,
            },
          },
        ],
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
});
