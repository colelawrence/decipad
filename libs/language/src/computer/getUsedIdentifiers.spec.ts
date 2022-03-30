import { getUsedIdentifiers } from './getUsedIdentifiers';

it('does nothing when there are no identifiers (I)', () => {
  expect(getUsedIdentifiers('1+1')).toMatchInlineSnapshot(`Array []`);
});

it('does nothing when there are no identifiers (II)', () => {
  expect(getUsedIdentifiers('1+1')).toMatchInlineSnapshot(`Array []`);
});

it('finds variable refs', () => {
  expect(getUsedIdentifiers('A')).toStrictEqual([
    {
      text: 'A',
      start: 0,
      end: 1,
      isDeclaration: false,
    },
  ]);
});

it('finds variable declarations', () => {
  expect(getUsedIdentifiers('A = 1')).toStrictEqual([
    { end: 1, start: 0, text: 'A', isDeclaration: true },
  ]);
});

it('finds column declarations', () => {
  expect(getUsedIdentifiers('A = { B = 1 }')[1]).toStrictEqual({
    text: 'B',
    start: 6,
    end: 7,
    isDeclaration: true,
  });
});

it('finds column usage', () => {
  expect(getUsedIdentifiers('A.B')).toStrictEqual([
    { text: 'A.B', start: 0, end: 3, isDeclaration: false },
  ]);
});

it('finds table column assignments', () => {
  expect(getUsedIdentifiers('Table.Hewwo = 1')).toStrictEqual([
    { text: 'Table.Hewwo', start: 0, end: 11, isDeclaration: true },
  ]);
});
