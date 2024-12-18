import { it, expect } from 'vitest';
import { rowIterableFromColumns } from './rowIterable';
import { Value } from '..';
import { all } from '@decipad/generator-utils';

it('returns a single row of a group of columns. Keeping shortest length', async () => {
  const columnMap: Parameters<typeof rowIterableFromColumns>[0] = new Map();

  columnMap.set(
    'Column1',
    Value.Column.fromValues([1, 2, 3, 4].map(Value.Scalar.fromValue), undefined)
  );

  columnMap.set(
    'Column2',
    Value.Column.fromValues(['1', '2'].map(Value.Scalar.fromValue), undefined)
  );

  columnMap.set(
    'Column3',
    Value.Column.fromValues(
      [true, true, false].map(Value.Scalar.fromValue),
      undefined
    )
  );

  const rowIterable = rowIterableFromColumns(columnMap);

  const allRows = await all(rowIterable());

  expect(allRows).toMatchInlineSnapshot(`
    [
      Map {
        "Column1" => NumberValue {
          "value": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        },
        "Column2" => StringValue {
          "value": "1",
        },
        "Column3" => BooleanValue {
          "value": true,
        },
      },
      Map {
        "Column1" => NumberValue {
          "value": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        },
        "Column2" => StringValue {
          "value": "2",
        },
        "Column3" => BooleanValue {
          "value": true,
        },
      },
    ]
  `);
});
