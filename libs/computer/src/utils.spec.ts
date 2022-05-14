import { parseOneStatement } from '@decipad/language';
import { program } from './testUtils';
import {
  findSymbolsUsed,
  getDefinedSymbol,
  getDefinedSymbolAt,
  parseDefName,
} from './utils';

it('figures out what symbol a statement creates, if any', () => {
  expect(getDefinedSymbol(parseOneStatement('A=1'))).toEqual('var:A');
  expect(getDefinedSymbol(parseOneStatement('"no-op"'))).toEqual(null);
  expect(
    getDefinedSymbol(parseOneStatement('Set = categories [ Exp ]'))
  ).toEqual('var:Set');
  expect(getDefinedSymbol(parseOneStatement('Mat[Set] = Exp'))).toEqual(
    'var:Mat'
  );
  expect(getDefinedSymbol(parseOneStatement('Mat[Set]'))).toEqual(null);
  expect(getDefinedSymbol(parseOneStatement('table.Col = 1'))).toEqual(
    'var:table'
  );
});

it('figures out what symbols a statement uses, if any', () => {
  expect(findSymbolsUsed(parseOneStatement('A + 1'))).toEqual([
    'fn:+',
    'var:A',
  ]);
  expect(findSymbolsUsed(parseOneStatement('"no-op"'))).toEqual([]);
  expect(findSymbolsUsed(parseOneStatement('Mat[Set]'))).toEqual([
    'var:Mat',
    'var:Set',
  ]);
  expect(findSymbolsUsed(parseOneStatement('Mat[Set] = Exp'))).toEqual([
    'var:Set',
    'var:Exp',
    'var:Mat',
  ]);
  expect(findSymbolsUsed(parseOneStatement('Table.Col = Hello'))).toEqual([
    'var:Hello',
    'var:Table',
  ]);
});

it('can parse a def name', () => {
  expect(parseDefName('var:A')).toEqual(['var', 'A']);
  expect(parseDefName('fn:A')).toEqual(['fn', 'A']);
  expect(() => parseDefName('malformed:A')).toThrow();
});

it('finds which symbol was defined at a loc', () => {
  expect(getDefinedSymbolAt(program, ['block-0', 0])).toEqual('var:A');
  expect(getDefinedSymbolAt(program, ['block-0', 1])).toEqual('var:Unused');
  expect(getDefinedSymbolAt(program, ['block-1', 1])).toEqual(null);
  expect(() => getDefinedSymbolAt(program, ['block-1', 99999])).toThrow();
  expect(() => getDefinedSymbolAt(program, ['block-99999', 1])).toThrow();
});
