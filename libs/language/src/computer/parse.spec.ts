import produce from 'immer';
import { updateParse } from './parse';

it('parses only the necessary parts', () => {
  const program = [
    {
      id: '0',
      source: 'A = 1',
    },
  ];
  const [toEvictNothingBecauseNoPrecedent, parsed] = updateParse(
    program,
    new Map()
  );
  expect(parsed).toMatchObject([
    {
      id: '0',
      block: {
        args: [{ type: 'assign' }],
      },
    },
  ]);
  expect(toEvictNothingBecauseNoPrecedent).toEqual([]);

  const firstParse = new Map(parsed.map((b) => [b.id, b]));

  // Will return the exact same object
  const [toEvictNothing, parsedSame] = updateParse(program, firstParse);
  expect(parsedSame[0]).toBe(firstParse.get('0'));
  expect(toEvictNothing).toEqual([]);

  // Will return a different object
  const changedProgram = produce(program, (p) => {
    p[0].source = 'A = 2';
  });
  const [toEvictDifferent, parsedDifferent] = updateParse(
    changedProgram,
    firstParse
  );
  expect(parsedDifferent[0]).not.toEqual(firstParse.get('0'));
  expect(toEvictDifferent).toEqual(['0']);

  // Will evict the missing ID
  const missingId = produce(program, (p) => {
    p[0].id = 'different';
  });
  const [toEvictDeleted] = updateParse(missingId, firstParse);
  expect(toEvictDeleted).toEqual(['0']);
});

it('reports syntax errors', () => {
  expect(
    updateParse(
      [
        {
          id: '0',
          source: 'syntax ---- error',
        },
      ],
      new Map()
    )
  ).toMatchObject([
    [],
    [
      {
        type: 'identified-error',
        id: '0',
        error: { message: 'Syntax error' },
      },
    ],
  ]);
});
