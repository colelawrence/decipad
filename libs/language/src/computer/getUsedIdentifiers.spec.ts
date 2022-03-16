import { getUsedIdentifiers } from './getUsedIdentifiers';

it('does nothing when there are no identifiers (I)', () => {
  expect(getUsedIdentifiers('1+1', new Set())).toMatchInlineSnapshot(
    `Array []`
  );
});

it('does nothing when there are no identifiers (II)', () => {
  expect(getUsedIdentifiers('1+1', new Set('A'))).toMatchInlineSnapshot(
    `Array []`
  );
});

it('finds variable declarations', () => {
  expect(getUsedIdentifiers('A = 1', new Set())).toStrictEqual([
    { end: 1, start: 0, text: 'A' },
  ]);
});

it('finds table declarations', () => {
  expect(getUsedIdentifiers('A = { B = 1 }', new Set())).toStrictEqual([
    { text: 'A', start: 0, end: 1 },
    { text: 'B', start: 6, end: 7 },
  ]);
});

it('finds previously defined variables', () => {
  expect(getUsedIdentifiers('A = B ', new Set('B'))[1]).toStrictEqual({
    text: 'B',
    start: 4,
    end: 5,
  });
});

it('finds column usage outside of a table definition', () => {
  const ids = getUsedIdentifiers('A = { B = 1 }\nA.B', new Set());
  expect(ids[2]).toStrictEqual({ text: 'A.B', start: 14, end: 17 });
});

it('find column usage inside table definition (I)', () => {
  const ids = getUsedIdentifiers('A = {\n  B = 1\n  C = B\n}', new Set());
  expect(ids[3]).toStrictEqual({ text: 'A.B', start: 20, end: 21 });
});

it('find column usage inside table definition (II)', () => {
  const ids = getUsedIdentifiers('A = {\n  B = 1\n  C = A.B\n}', new Set());
  expect(ids[3]).toStrictEqual({ text: 'A.B', start: 20, end: 23 });
});
