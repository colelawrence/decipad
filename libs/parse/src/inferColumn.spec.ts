import { Computer } from '@decipad/computer';
import { inferColumn } from './inferColumn';

it('infer column with percentages', () => {
  const computer = new Computer();
  let result = inferColumn(computer, [100, 200, 300]);
  expect(result).toMatchInlineSnapshot(`
    Object {
      "kind": "number",
      "unit": null,
    }
  `);

  result = inferColumn(computer, ['100%', '20', '30']);
  expect(result).toMatchInlineSnapshot(`
    Object {
      "kind": "number",
      "numberFormat": "percentage",
    }
  `);
});
