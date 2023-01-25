import { computerWithBlocks } from '../testUtils';

it('tracks variable usage', async () => {
  const computer = await computerWithBlocks('x = 1', 'y = 2', 'x');
  expect(computer.isInUse('block-0')).toBe(true);
  expect(computer.isInUse('block-1')).toBe(false);
  expect(computer.isInUse('block-2')).toBe(false);
});

it("tracks tables' usage", async () => {
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

it('ignores errored blocks while tracking', async () => {
  const computer = await computerWithBlocks('x = 1', 'x + "typeerror"');
  expect(computer.isInUse('block-0')).toBe(false);
  expect(computer.isInUse('block-1')).toBe(false);
});
