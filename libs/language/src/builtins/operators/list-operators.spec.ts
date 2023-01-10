import { runCode } from '../../run';
import { typeSnapshotSerializer } from '../../testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

describe('list operators', () => {
  it('concatenates lists', async () => {
    expect(await runCode('cat([1, 2], [3, 4])')).toMatchInlineSnapshot(`
      Object {
        "type": column<number>,
        "value": Array [
          DeciNumber(1),
          DeciNumber(2),
          DeciNumber(3),
          DeciNumber(4),
        ],
      }
    `);
  });

  it('calculates columns lengths', async () => {
    expect(await runCode('len([1, 2, 3])')).toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(3),
      }
    `);
  });

  it('retrieves the first element of a list', async () => {
    expect(await runCode('first([1, 2, 3] meters)')).toMatchInlineSnapshot(`
      Object {
        "type": meters,
        "value": DeciNumber(1),
      }
    `);
  });

  it('retrieves the last element of a list', async () => {
    expect(await runCode('last([1, 2, 3] meters)')).toMatchInlineSnapshot(`
      Object {
        "type": meters,
        "value": DeciNumber(3),
      }
    `);
  });

  it('countif: counts the true elements in a list', async () => {
    expect(await runCode('countif([true, false, true])'))
      .toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(2),
      }
    `);
  });

  it('sorts a list', async () => {
    expect(await runCode('sort([2, -1, 11])')).toMatchInlineSnapshot(`
      Object {
        "type": column<number>,
        "value": Array [
          DeciNumber(-1),
          DeciNumber(2),
          DeciNumber(11),
        ],
      }
    `);
  });

  it('uniques list', async () => {
    expect(await runCode('unique([1, 3, 2, 1, 3, 4])')).toMatchInlineSnapshot(`
      Object {
        "type": column<number>,
        "value": Array [
          DeciNumber(1),
          DeciNumber(2),
          DeciNumber(3),
          DeciNumber(4),
        ],
      }
    `);
  });

  it('reverses a list', async () => {
    expect(await runCode('reverse([3, 2, 1])')).toMatchInlineSnapshot(`
      Object {
        "type": column<number>,
        "value": Array [
          DeciNumber(1),
          DeciNumber(2),
          DeciNumber(3),
        ],
      }
    `);
  });

  it('reverses a table', async () => {
    expect(
      await runCode(`
        Table = { A = [1, 2, 3], B = [6, 4, 5] }
        reverse(Table)
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "type": table<A = number, B = number>,
        "value": Array [
          Array [
            DeciNumber(3),
            DeciNumber(2),
            DeciNumber(1),
          ],
          Array [
            DeciNumber(5),
            DeciNumber(4),
            DeciNumber(6),
          ],
        ],
      }
    `);
  });
});
