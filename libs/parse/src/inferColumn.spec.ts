import { getExprRef, getRemoteComputer } from '@decipad/remote-computer';
import { inferColumn } from './inferColumn';
import { getIdentifiedBlocks } from '../../computer/src/testUtils';

it('infer column with percentages', async () => {
  const computer = getRemoteComputer();
  let result = await inferColumn(computer, [100, 200, 300]);
  expect(result).toMatchInlineSnapshot(`
    Object {
      "kind": "number",
      "unit": null,
    }
  `);

  result = await inferColumn(computer, ['100%', '20', '30']);
  expect(result).toMatchInlineSnapshot(`
    Object {
      "kind": "number",
      "numberFormat": "percentage",
    }
  `);
});

it('infers columns with references to other variables', async () => {
  const computer = getRemoteComputer();
  const program = getIdentifiedBlocks('x = 1');
  const { id } = program[0];

  await computer.computeDeltaRequest({
    program: {
      upsert: program,
    },
  });

  await expect(inferColumn(computer, [getExprRef(id)])).resolves.toMatchObject({
    kind: 'number',
    unit: null,
  });
});

//
// This is because it seems to cause more problems than its worth.
// If you write 'false' getting a checkmark is nice, but imagine
// this comes from a variable. Annoying.
//
it('doesnt infer booleans', async () => {
  const computer = getRemoteComputer();
  const result = await inferColumn(computer, ['true'], {
    doNotInferBoolean: true,
  });

  expect(result).toMatchObject({
    kind: 'string',
  });
});

it('infers booleans by default', async () => {
  const computer = getRemoteComputer();
  const result = await inferColumn(computer, ['true']);

  expect(result).toMatchObject({
    kind: 'boolean',
  });
});
