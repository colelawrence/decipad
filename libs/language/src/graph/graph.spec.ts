import { getExternalScope } from './index';
import { blocks } from './testFixtures';

it('gets external scope (ins and outs)', () => {
  const graph = blocks.map((block) => getExternalScope(block));
  expect(graph).toEqual([
    {
      deps: [],
      exports: ['b'],
      funcExports: [],
    },
    {
      deps: ['b'],
      exports: ['a'],
      funcExports: ['func'],
    },
  ]);
});
