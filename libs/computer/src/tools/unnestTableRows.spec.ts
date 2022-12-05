import { buildType, Result, serializeType } from '@decipad/language';
import { F } from 'libs/language/src/utils';
import { unnestTableRows } from './unnestTableRows';

it('unnests table rows', () => {
  const explanation = [
    {
      indexedBy: 'Table',
      labels: ['label1', 'label2'],
      dimensionLength: 1,
    },
  ];
  const result = {
    type: serializeType(buildType.column(buildType.number())),
    value: [F(1), F(2)],
  } as Result.Result<'column'>;

  expect([...unnestTableRows(explanation, result)]).toMatchInlineSnapshot(`
    Array [
      Object {
        "labelInfo": Array [
          Object {
            "indexAtThisDimension": 0,
            "indexName": "Table",
            "indexesOfRemainingLengthsAreZero": true,
            "label": "label1",
            "lengthAtThisDimension": 1,
            "productOfRemainingLengths": 1,
          },
        ],
        "result": Object {
          "type": Object {
            "kind": "number",
            "unit": null,
          },
          "value": Fraction(1),
        },
      },
      Object {
        "labelInfo": Array [
          Object {
            "indexAtThisDimension": 1,
            "indexName": "Table",
            "indexesOfRemainingLengthsAreZero": true,
            "label": "label2",
            "lengthAtThisDimension": 1,
            "productOfRemainingLengths": 1,
          },
        ],
        "result": Object {
          "type": Object {
            "kind": "number",
            "unit": null,
          },
          "value": Fraction(2),
        },
      },
    ]
  `);
});
