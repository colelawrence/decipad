import {
  r,
  c,
  l,
  assign,
  matrixRef,
  matrixAssign,
  categories,
  tableColAssign,
} from '../utils';
import { program } from './testutils';
import {
  findSymbolsUsed,
  getDefinedSymbol,
  getDefinedSymbolAt,
  parseDefName,
} from './utils';

it('figures out what symbol a statement creates, if any', () => {
  expect(getDefinedSymbol(assign('A', l(1)))).toEqual('var:A');
  expect(getDefinedSymbol(l('no-op'))).toEqual(null);
  expect(getDefinedSymbol(categories('Set', r('Exp')))).toEqual('var:Set');
  expect(getDefinedSymbol(matrixAssign('Mat', [r('Set')], r('Exp')))).toEqual(
    'var:Mat'
  );
  expect(getDefinedSymbol(matrixRef('Mat', [r('Set')]))).toEqual(null);
  expect(getDefinedSymbol(tableColAssign('Table', 'Col', l(1)))).toEqual(
    'var:Table'
  );
});

it('figures out what symbols a statement uses, if any', () => {
  expect(findSymbolsUsed(c('+', r('A'), l(1)))).toEqual(['fn:+', 'var:A']);
  expect(findSymbolsUsed(l('no-op'))).toEqual([]);
  expect(findSymbolsUsed(matrixRef('Mat', [r('Set')]))).toEqual([
    'var:Mat',
    'var:Set',
  ]);
  expect(findSymbolsUsed(matrixAssign('Mat', [r('Set')], r('Exp')))).toEqual([
    'var:Set',
    'var:Exp',
    'var:Mat',
  ]);
  expect(findSymbolsUsed(tableColAssign('Table', 'Col', r('Hello')))).toEqual([
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
