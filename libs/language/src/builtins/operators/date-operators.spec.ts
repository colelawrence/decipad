import { runCode } from '../../run';
import { typeSnapshotSerializer } from '../../testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

describe('extract operators', () => {
  it('extract day', async () => {
    expect(await runCode('pick(date(2020-03-15), day)')).toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(15),
      }
    `);

    expect(await runCode('pick(date(2020-03-15), year)'))
      .toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(2020),
      }
    `);

    expect(await runCode('pick(date(2020-03-15), month)'))
      .toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(3),
      }
    `);

    expect(await runCode('pick(date(2020-03-15T18:32), hour)'))
      .toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(18),
      }
    `);

    expect(await runCode('pick(date(2020-03-15T18:32), minute)'))
      .toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(32),
      }
    `);

    expect(await runCode('pick(date(2020-03-15T18:32), second)'))
      .toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": DeciNumber(0),
      }
    `);
  });
});
