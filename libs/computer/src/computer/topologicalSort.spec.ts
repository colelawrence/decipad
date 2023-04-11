import { getIdentifiedBlocks } from '../testUtils';
import { topologicalSort } from './topologicalSort';

it('sorts two dependencies', async () => {
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

it('sorts code with tables', () => {
  const program = getIdentifiedBlocks('T = { A = 1, B = 2 }', 'T.C = A + B');
  const sorted = topologicalSort(program);
  expect(sorted).toHaveLength(program.length);
  expect(sorted.map((r) => r.id)).toEqual(['block-0', 'block-1']);
});

it('sorts code with weirdly ordered table definitions', () => {
  const program = getIdentifiedBlocks(
    'T.C = A + D',
    'T = { A = 1, B = 2 }',
    'T.D = A + B + CC',
    'CC = 100'
  );
  const sorted = topologicalSort(program);
  expect(sorted).toHaveLength(program.length);
  expect(sorted.map((r) => r.id)).toEqual([
    'block-1',
    'block-3',
    'block-2',
    'block-0',
  ]);
});
