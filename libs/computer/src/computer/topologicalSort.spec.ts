import { wrappedParse } from './parse';
import { topologicalSort } from './topologicalSort';

it('sorts two dependencies', async () => {
  const program = [
    {
      id: 'block-A',
      source: 'A = B + 1',
    },
    {
      id: 'block-B',
      source: 'B = 42',
    },
  ];
  const parsed = program.map(wrappedParse);
  const sorted = topologicalSort(parsed);
  expect(sorted).toHaveLength(program.length);
  expect(sorted.map((r) => r.id)).toEqual(['block-B', 'block-A']);
});

it('sorts transitive dependency', () => {
  const program = [
    {
      id: 'block-A',
      source: 'A = B + 1',
    },
    {
      id: 'block-B',
      source: 'B = C + 2',
    },
    {
      id: 'block-C',
      source: 'C = 42',
    },
    {
      id: 'block-D',
      source: 'D = 43',
    },
  ];
  const parsed = program.map(wrappedParse);
  const sorted = topologicalSort(parsed);
  expect(sorted).toHaveLength(program.length);
  expect(sorted.map((r) => r.id)).toEqual([
    'block-C',
    'block-B',
    'block-A',
    'block-D',
  ]);
});

it('detects circular dependencies', () => {
  const program = [
    {
      id: 'block-A',
      source: 'A = B + 1',
    },
    {
      id: 'block-B',
      source: 'B = A + 2',
    },
    {
      id: 'block-C',
      source: 'C = 42',
    },
  ];
  const parsed = program.map(wrappedParse);
  const sorted = topologicalSort(parsed);
  expect(sorted).toHaveLength(program.length);
  expect(sorted).toMatchObject([
    {
      id: 'block-C',
      type: 'identified-block',
    },
    {
      id: 'block-A',
      type: 'identified-error',
      error: {
        message: 'Circular dependency detected',
      },
    },
    {
      id: 'block-B',
      type: 'identified-error',
      error: {
        message: 'Circular dependency detected',
      },
    },
  ]);
});
