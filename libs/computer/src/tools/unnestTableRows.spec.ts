import { buildType, Result, serializeType } from '@decipad/language';
import { getDefined, timeout } from '@decipad/utils';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AsciiTable from 'ascii-table';
import { N } from '@decipad/number';
import { Computer } from '../computer/Computer';
import { getIdentifiedBlocks } from '../testUtils';
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
    value: [N(1), N(2)],
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
          "value": DeciNumber(1),
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
          "value": DeciNumber(2),
        },
      },
    ]
  `);
});

describe('can provide information for rendering matrices', () => {
  let computer: Computer;
  beforeEach(async () => {
    computer = new Computer({ requestDebounceMs: 0 });
    computer.pushCompute({
      program: getIdentifiedBlocks(
        `Table = { Xs = [10, 20, 30] }`,
        `Matrix = [100, 200] * Table.Xs`
      ),
    });
    await timeout(0);
  });

  it('can retrieve labels', () => {
    expect(
      computer.explainDimensions$.get(
        computer.getBlockIdResult$.get('block-1')
          ?.result as Result.Result<'column'>
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "dimensionLength": 2,
          "indexedBy": undefined,
          "labels": undefined,
        },
        Object {
          "dimensionLength": 3,
          "indexedBy": "Table",
          "labels": Array [
            "10",
            "20",
            "30",
          ],
        },
      ]
    `);
  });

  it('can turn nested matrices to a tabular data format', () => {
    const result = getDefined(
      computer.getBlockIdResult$.get('block-1')?.result
    ) as Result.Result<'column'>;
    const dimExplanation = getDefined(computer.explainDimensions$.get(result));

    const aTable = new AsciiTable('Matrix');

    aTable.setHeading(
      ...dimExplanation.map((v) => v.indexedBy ?? '(no dimension)')
    );

    for (const {
      labelInfo,
      result: { value },
    } of unnestTableRows(dimExplanation, result)) {
      aTable.addRow(
        ...labelInfo.map((label) => label.label ?? label.indexAtThisDimension),
        value
      );
    }

    expect(aTable.toString()).toMatchInlineSnapshot(`
      ".-------------------------------.
      |            Matrix             |
      |-------------------------------|
      | (no dimension) | Table |      |
      |----------------|-------|------|
      |              0 | 10    | 1000 |
      |              0 | 20    | 2000 |
      |              0 | 30    | 3000 |
      |              1 | 10    | 2000 |
      |              1 | 20    | 4000 |
      |              1 | 30    | 6000 |
      '-------------------------------'"
    `);
  });
});
