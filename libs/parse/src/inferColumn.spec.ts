import { getRemoteComputer } from '@decipad/remote-computer';
import { inferColumn } from './inferColumn';

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
