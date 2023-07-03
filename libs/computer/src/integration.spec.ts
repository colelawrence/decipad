import { getDefined } from '@decipad/utils';
import { Computer } from './computer';
import { getIdentifiedBlocks } from './testUtils';

describe('cache', () => {
  it('epoch starts in 1', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks('_A = 1', '_B = 2', '_C = _A + _B');
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    expect(results.blockResults['block-2'].result?.value?.toString()).toBe('3');
    expect(
      Object.values(results.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      Array [
        1n,
        1n,
        1n,
      ]
    `);
  });

  it('epoch increments', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks('_A = 1', '_B = 2', '_C = _A + _B');
    const r1 = getDefined(await computer.computeRequest({ program }));
    expect(
      Object.values(r1.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      Array [
        1n,
        1n,
        1n,
      ]
    `);
    const b3 = getIdentifiedBlocks('_A = 1', '_B = 2', '_C = _A + _B + 1')[2];
    program[2] = b3;
    const r2 = getDefined(await computer.computeRequest({ program }));
    expect(
      Object.values(r2.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      Array [
        1n,
        1n,
        2n,
      ]
    `);

    const b1 = getIdentifiedBlocks('_A = 3', '_B = 2', '_C = _A + _B + 1')[0];
    program[0] = b1;
    const r3 = getDefined(await computer.computeRequest({ program }));
    expect(
      Object.values(r3.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      Array [
        3n,
        1n,
        3n,
      ]
    `);
  });
});
