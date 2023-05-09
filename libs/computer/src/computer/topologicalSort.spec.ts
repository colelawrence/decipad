import { getIdentifiedBlocks } from '../testUtils';
import { topologicalSort } from './topologicalSort';

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
