import { parseStatementOrThrow } from '@decipad/language';
import { findSymbolsUsed, getDefinedSymbol, setIntersection } from './utils';

it('figures out what symbol a statement creates, if any', () => {
  expect(getDefinedSymbol(parseStatementOrThrow('A=1'))).toEqual('A');
  expect(getDefinedSymbol(parseStatementOrThrow('"no-op"'))).toEqual(null);
  expect(
    getDefinedSymbol(parseStatementOrThrow('Set = categories [ Exp ]'))
  ).toEqual('Set');
  expect(getDefinedSymbol(parseStatementOrThrow('Mat[Set] = Exp'))).toEqual(
    'Mat'
  );
  expect(getDefinedSymbol(parseStatementOrThrow('Mat[Set]'))).toEqual(null);
  expect(getDefinedSymbol(parseStatementOrThrow('table.Col = 1'))).toEqual(
    'table'
  );
});

it('intersects two sets of strings', () => {
  expect(setIntersection(new Set(['1.', '2.']), new Set(['2.', '3.']))).toEqual(
    new Set(['2.'])
  );
});

it('figures out what symbols a statement uses, if any', () => {
  expect(findSymbolsUsed(parseStatementOrThrow('A + 1'))).toEqual(['+', 'A']);
  expect(findSymbolsUsed(parseStatementOrThrow('"no-op"'))).toEqual([]);
  expect(findSymbolsUsed(parseStatementOrThrow('Mat[Set]'))).toEqual([
    'Mat',
    'Set',
  ]);
  expect(findSymbolsUsed(parseStatementOrThrow('Mat[Set] = Exp'))).toEqual([
    'Set',
    'Exp',
    'Mat',
  ]);
  expect(findSymbolsUsed(parseStatementOrThrow('Table.Col = Hello'))).toEqual([
    'Hello',
    'Table',
  ]);
});
