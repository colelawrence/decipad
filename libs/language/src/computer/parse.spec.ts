import produce from 'immer';
import { updateParse } from './parse';
import { UnparsedBlock } from './types';

it('parses only the necessary parts', () => {
  const program: UnparsedBlock[] = [
    {
      id: '0',
      type: 'unparsed-block',
      source: 'A = 1',
    },
  ];
  const firstParse = updateParse(program);
  expect(firstParse).toMatchObject([
    {
      id: '0',
      block: {
        args: [{ type: 'assign' }],
      },
    },
  ]);

  // Will return the exact same object
  const parsedSame = updateParse(program, firstParse);
  expect(parsedSame[0]).toBe(firstParse[0]);

  // Will return a different object
  const changedProgram = produce(program, (p) => {
    p[0].source = 'A = 2';
  });
  const parsedDifferent = updateParse(changedProgram, firstParse);
  expect(parsedDifferent[0]).not.toEqual(firstParse[0]);
});

it('reports syntax errors', () => {
  expect(
    updateParse([
      {
        id: '0',
        type: 'unparsed-block',
        source: 'syntax --/-- error',
      },
    ])
  ).toMatchObject([
    {
      type: 'identified-error',
      id: '0',
    },
  ]);
});
