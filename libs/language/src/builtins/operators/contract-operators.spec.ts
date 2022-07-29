import { runCode } from '../../run';
import { typeSnapshotSerializer } from '../../testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

describe('contract operators', () => {
  it('assert to exist', async () => {
    expect(await runCode('assert(1)')).toMatchInlineSnapshot(`
      Object {
        "type": InferError expected-but-got,
        "value": true,
      }
    `);
  });
});
