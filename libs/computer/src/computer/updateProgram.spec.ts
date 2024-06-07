import type { ComputerProgram, Program } from '@decipad/computer-interfaces';
import { updateProgram } from './updateProgram';
import { astNode } from '..';
import { N } from '@decipad/number';

it('prioritises adding instead of removing in same req', () => {
  //
  // Take a look at this PR: https://github.com/decipad/decipad/pull/6025
  // When moving an element to another tab, we insert and remove a block.
  // This was causing a conflict when entering updateProgram.
  //

  const program: Program = [
    {
      type: 'identified-block',
      id: '1',
      block: astNode(
        'block',
        astNode(
          'assign',
          astNode('def', 'Variable'),
          astNode('literal', 'number', N(1))
        )
      ),
    },
  ];

  const computerProgram: ComputerProgram = {
    asSequence: program,
    asBlockIdMap: new Map([['1', program[0]]]),
  };

  expect(
    updateProgram(computerProgram, new Map(), {
      program: { upsert: program, remove: ['1'] },
    }).program
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "block": Object {
          "args": Array [
            Object {
              "args": Array [
                Object {
                  "args": Array [
                    "Variable",
                  ],
                  "type": "def",
                },
                Object {
                  "args": Array [
                    "number",
                    DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 1n,
                      "s": 1n,
                    },
                  ],
                  "type": "literal",
                },
              ],
              "type": "assign",
            },
          ],
          "type": "block",
        },
        "id": "1",
        "type": "identified-block",
      },
    ]
  `);
});
