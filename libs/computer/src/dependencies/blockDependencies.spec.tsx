import { computerWithBlocks } from '../testUtils';

it('tracks variable on empty computer', async () => {
  const computer = await computerWithBlocks();
  expect(computer.isInUse('block-0')).toBe(false);
});

it('tracks variable usage when used', async () => {
  const computer = await computerWithBlocks('x = 1', 'y = 2', 'x');
  expect(computer.isInUse('block-0')).toBe(true);
});

it('tracks variable usage when not used without deps', async () => {
  const computer = await computerWithBlocks('x = 1', 'y = 2', 'x');
  expect(computer.isInUse('block-1')).toBe(false);
});

it('tracks variable usage when not used with dep graph', async () => {
  const computer = await computerWithBlocks('x = 1', 'y = 2', 'x');
  expect(computer.programDependencies('block-0')).toStrictEqual([
    {
      inBlockId: 'block-0',
      dependentBlockIds: ['block-2'],
      varName: 'x',
    },
  ]);
  expect(computer.programDependencies('block-1')).toStrictEqual([
    {
      inBlockId: 'block-1',
      dependentBlockIds: [],
      varName: 'y',
    },
  ]);
});

it('tracks variable but can show only those with dependencies', async () => {
  const computer = await computerWithBlocks('x = 1', 'y = 2', 'x');
  expect(computer.blocksInUse('block-0')).toStrictEqual([
    {
      inBlockId: 'block-0',
      dependentBlockIds: ['block-2'],
      varName: 'x',
    },
  ]);
  expect(computer.blocksInUse('block-1')).toStrictEqual([]);
});

it('tracks variable usage in more than a place', async () => {
  const computer = await computerWithBlocks('x = 1', 'y = 2', 'x', 'x', 'y');
  expect(computer.isInUse('block-0')).toBe(true);
  expect(computer.isInUse('block-1')).toBe(true);
  expect(computer.isInUse('block-2')).toBe(false);
  expect(computer.isInUse('block-3')).toBe(false);
  expect(computer.isInUse('block-4')).toBe(false);
});

it('can get meta data about everywhere a block is used', async () => {
  const computer = await computerWithBlocks('x = 1', 'y = 2', 'x', 'x', 'y');
  expect(computer.programDependencies('block-0')).toStrictEqual([
    {
      inBlockId: 'block-0',
      dependentBlockIds: ['block-2', 'block-3'],
      varName: 'x',
    },
  ]);
  expect(computer.programDependencies('block-1')).toStrictEqual([
    {
      inBlockId: 'block-1',
      dependentBlockIds: ['block-4'],
      varName: 'y',
    },
  ]);
  expect(computer.programDependencies('block-2')).toStrictEqual([
    {
      inBlockId: 'block-2',
      dependentBlockIds: [],
      varName: 'exprRef_block_2',
    },
  ]);
});

it('works for blocks that use two variables', async () => {
  const computer = await computerWithBlocks('x = 1', 'y = 2', 'x + y');
  expect(computer.programDependencies('block-0')).toStrictEqual([
    {
      inBlockId: 'block-0',
      dependentBlockIds: ['block-2'],
      varName: 'x',
    },
  ]);
  expect(computer.programDependencies('block-1')).toStrictEqual([
    {
      inBlockId: 'block-1',
      dependentBlockIds: ['block-2'],
      varName: 'y',
    },
  ]);
  expect(computer.programDependencies('block-2')).toStrictEqual([
    {
      inBlockId: 'block-2',
      dependentBlockIds: [],
      varName: 'exprRef_block_2',
    },
  ]);
});

it("tracks tables' usage without meta stuff", async () => {
  const computer = await computerWithBlocks(
    'table = {}',
    'table.x = 1',
    'table.y = 2',
    'table.x'
  );
  expect(computer.isInUse('block-0')).toBe(true);
  expect(computer.isInUse('block-1')).toBe(true);
  expect(computer.isInUse('block-2')).toBe(false);
  expect(computer.isInUse('block-3')).toBe(false);
});

it("tracks tables' usage and knows the block ids", async () => {
  const computer = await computerWithBlocks(
    'table = {}',
    'table.x = 1',
    'table.y = 2',
    'table.x'
  );
  expect(computer.programDependencies('block-0')).toStrictEqual([
    {
      inBlockId: 'block-0',
      dependentBlockIds: ['block-1', 'block-2', 'block-3'],
      varName: 'table',
    },
  ]);
  expect(computer.programDependencies('block-1')).toStrictEqual([
    {
      inBlockId: 'block-1',
      dependentBlockIds: ['block-3'],
      varName: 'table.x',
    },
  ]);
  expect(computer.programDependencies('block-2')).toStrictEqual([
    {
      inBlockId: 'block-2',
      dependentBlockIds: [],
      varName: 'table.y',
    },
  ]);
});

it("tracks tables' usage (2)", async () => {
  const computer = await computerWithBlocks(
    'table = {}',
    'table.x = 1',
    'renamedtable = table',
    'renamedtable'
  );
  expect(computer.isInUse('block-2')).toBe(true);
});

it("tracks functions' usage", async () => {
  const computer = await computerWithBlocks(
    'f(x) = 1',
    'fUnused(x) = 2',
    'f(1)'
  );
  expect(computer.isInUse('block-0')).toBe(true);
  expect(computer.isInUse('block-1')).toBe(false);
});
