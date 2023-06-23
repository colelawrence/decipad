import { getIdentifiedBlocks } from '../testUtils';
import { topologicalSort } from './topologicalSort';
import { flattenTableDeclarations } from './transformTables';

it('sorts two dependencies', () => {
  const program = getIdentifiedBlocks('A = B + 1', 'B = 42');
  const sorted = topologicalSort(program);
  expect(sorted).toHaveLength(program.length);
  expect(sorted.map((r) => r.id)).toEqual(['block-1', 'block-0']);
});

it('sorts transitive dependency', () => {
  const program = getIdentifiedBlocks(
    'A = B + 1',
    'B = C + 2',
    'C = 42',
    'D = 43'
  );
  const sorted = topologicalSort(program);
  expect(sorted).toHaveLength(program.length);
  expect(sorted.map((r) => r.id)).toEqual([
    'block-2',
    'block-1',
    'block-0',
    'block-3',
  ]);
});

it('detects circular dependencies', () => {
  const program = getIdentifiedBlocks('A = B + 1', 'B = A + 2', 'C = 42');
  const sorted = topologicalSort(program);
  expect(sorted).toHaveLength(program.length);
  expect(sorted).toMatchObject([
    {
      id: 'block-2',
      type: 'identified-block',
    },
    {
      id: 'block-0',
      type: 'identified-error',
      errorKind: 'dependency-cycle',
    },
    {
      id: 'block-1',
      type: 'identified-error',
      errorKind: 'dependency-cycle',
    },
  ]);
});

it('can sort dependencies in column formulae', () => {
  const program = getIdentifiedBlocks(
    'Table1 = {}',
    'Table1.Column1 = [1, 2, 3]',
    'Table1.Column2 = Column3',
    'Table1.Column3 = [4, 5, 6]'
  );
  const sorted = topologicalSort(program);

  expect(sorted).toHaveLength(program.length);
  expect(sorted.map((b) => b.id)).toMatchObject([
    'block-0',
    'block-1',
    'block-3',
    'block-2',
  ]);
});

it('can sort complex column dependencies correctly', () => {
  const program = getIdentifiedBlocks(
    'Table1 = {}', // 0
    'Table1.Column1 = [1, 2, 3]', // 1
    'Table1.Column2 = Table2.Column2', // 2
    'Table3 = concatenate(Table1, Table2)', // 3
    `Table2 = {
      Column1 = Table1.Column1,
      Column2 = [4,5,6]
    }` // 4, 4_0, 4_1
  );

  const transformed = flattenTableDeclarations(program);

  expect(
    transformed.map((b) => b.definesTableColumn || b.definesVariable)
  ).toMatchObject([
    'Table1',
    ['Table1', 'Column1'],
    ['Table1', 'Column2'],
    'Table3',
    'Table2',
    ['Table2', 'Column1'],
    ['Table2', 'Column2'],
  ]);

  const sorted = topologicalSort(transformed);

  expect(sorted).toHaveLength(transformed.length);
  expect(sorted.map((b) => b.definesTableColumn || b.definesVariable))
    .toMatchInlineSnapshot(`
    Array [
      "Table1",
      Array [
        "Table1",
        "Column1",
      ],
      "Table2",
      Array [
        "Table2",
        "Column1",
      ],
      Array [
        "Table2",
        "Column2",
      ],
      Array [
        "Table1",
        "Column2",
      ],
      "Table3",
    ]
  `);
});
