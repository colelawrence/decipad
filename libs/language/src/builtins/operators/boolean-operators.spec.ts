import { runCode } from '../../run';
import { typeSnapshotSerializer } from '../../testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

describe('boolean operators', () => {
  it('runs boolean ops', async () => {
    expect(await runCode(`!true`)).toMatchInlineSnapshot(`
      Object {
        "type": boolean,
        "value": false,
      }
    `);
    expect(await runCode(`!1`)).toMatchInlineSnapshot(`
      Object {
        "type": InferError expected-but-got,
        "value": false,
      }
    `);
  });

  it('ands two booleans', async () => {
    expect(await runCode(`true && true`)).toMatchInlineSnapshot(`
      Object {
        "type": boolean,
        "value": true,
      }
    `);
    expect(await runCode(`false && true`)).toMatchInlineSnapshot(`
      Object {
        "type": boolean,
        "value": false,
      }
    `);
    expect(await runCode(`false && "Hello"`)).toMatchInlineSnapshot(`
      Object {
        "type": InferError expected-but-got,
        "value": false,
      }
    `);
  });
});
