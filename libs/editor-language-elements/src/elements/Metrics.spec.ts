import { it, expect, beforeEach } from 'vitest';
import { Metric } from './Metrics';
import { Computer, getIdentifiedBlock } from '@decipad/computer';
import { createTestEditorController } from '../testEditorController';
import { ELEMENT_METRIC, MetricElement } from '@decipad/editor-types';
import { AggregationIds } from '@decipad/language-aggregations';
import { prettyPrintProgram } from 'libs/computer/src/testUtils';

let computer = new Computer();
const editor = createTestEditorController('id');

const metricWidget = (element: MetricElement) =>
  Metric.getParsedBlockFromElement!(editor, computer, element);

beforeEach(() => {
  computer = new Computer();
});

it('generates a simple aggregation', async () => {
  await computer.pushComputeDelta({
    program: {
      upsert: [getIdentifiedBlock('A = [1, 2, 3]', 0, 'block_')],
    },
  });

  const aggregationType: AggregationIds = 'number:average';

  expect(
    prettyPrintProgram(
      await metricWidget({
        type: ELEMENT_METRIC,
        id: 'id',
        blockId: 'block_0',
        caption: 'caption',
        children: [{ text: '' }],
        comparisonBlockId: 'comparison-id',
        comparisonDescription: '',
        aggregation: aggregationType,
      })
    )
  ).toMatchInlineSnapshot(`
    [
      {
        "artificiallyDerivedFrom": undefined,
        "block": "(block
      (assign
        (def exprRef_id)
        (avg (ref exprRef_block_0))))",
        "definesVariable": "exprRef_id",
        "id": "id",
        "isArtificial": undefined,
        "type": "identified-block",
      },
      {
        "artificiallyDerivedFrom": undefined,
        "block": "(block
      (assign
        (def exprRef_id_comparison)
        (ref exprRef_comparison_id)))",
        "definesVariable": "exprRef_id_comparison",
        "id": "id-comparison",
        "isArtificial": undefined,
        "type": "identified-block",
      },
      {
        "artificiallyDerivedFrom": undefined,
        "block": "(block
      (assign
        (def exprRef_id_trend)
        (trend (column (ref exprRef_comparison_id) (avg (ref exprRef_block_0))))))",
        "definesVariable": "exprRef_id_trend",
        "id": "id-trend",
        "isArtificial": undefined,
        "type": "identified-block",
      },
    ]
  `);
});

it('returns a reference to the blockID if no aggregation is present', async () => {
  await computer.pushComputeDelta({
    program: {
      upsert: [getIdentifiedBlock('A = [1, 2, 3]', 0, 'block_')],
    },
  });

  expect(
    prettyPrintProgram(
      await metricWidget({
        type: ELEMENT_METRIC,
        id: 'id',
        blockId: 'block_0',
        caption: 'caption',
        children: [{ text: '' }],
        comparisonBlockId: 'comparison-id',
        comparisonDescription: '',
      })
    )
  ).toMatchInlineSnapshot(`
    [
      {
        "artificiallyDerivedFrom": undefined,
        "block": "(block
      (assign
        (def exprRef_id)
        (ref exprRef_block_0)))",
        "definesVariable": "exprRef_id",
        "id": "id",
        "isArtificial": undefined,
        "type": "identified-block",
      },
      {
        "artificiallyDerivedFrom": undefined,
        "block": "(block
      (assign
        (def exprRef_id_comparison)
        (ref exprRef_comparison_id)))",
        "definesVariable": "exprRef_id_comparison",
        "id": "id-comparison",
        "isArtificial": undefined,
        "type": "identified-block",
      },
      {
        "artificiallyDerivedFrom": undefined,
        "block": "(block
      (assign
        (def exprRef_id_trend)
        (trend (column (ref exprRef_comparison_id) (ref exprRef_block_0)))))",
        "definesVariable": "exprRef_id_trend",
        "id": "id-trend",
        "isArtificial": undefined,
        "type": "identified-block",
      },
    ]
  `);
});

it('generates the comparrison aggregation and trend', async () => {
  await computer.pushComputeDelta({
    program: {
      upsert: [
        getIdentifiedBlock('A = [1, 2, 3]', 0, 'block_'),
        getIdentifiedBlock('B = [2, 3, 4]', 1, 'block_'),
      ],
    },
  });

  const aggregationType: AggregationIds = 'number:average';
  const comparisonAggregationType: AggregationIds = 'number:min';

  expect(
    prettyPrintProgram(
      await metricWidget({
        type: ELEMENT_METRIC,
        id: 'id',

        blockId: 'block_0',
        comparisonBlockId: 'block_1',

        caption: 'caption',
        children: [{ text: '' }],
        comparisonDescription: '',

        aggregation: aggregationType,
        comparisonAggregation: comparisonAggregationType,
      })
    )
  ).toMatchInlineSnapshot(`
    [
      {
        "artificiallyDerivedFrom": undefined,
        "block": "(block
      (assign
        (def exprRef_id)
        (avg (ref exprRef_block_0))))",
        "definesVariable": "exprRef_id",
        "id": "id",
        "isArtificial": undefined,
        "type": "identified-block",
      },
      {
        "artificiallyDerivedFrom": undefined,
        "block": "(block
      (assign
        (def exprRef_id_comparison)
        (min (ref exprRef_block_1))))",
        "definesVariable": "exprRef_id_comparison",
        "id": "id-comparison",
        "isArtificial": undefined,
        "type": "identified-block",
      },
      {
        "artificiallyDerivedFrom": undefined,
        "block": "(block
      (assign
        (def exprRef_id_trend)
        (trend (column (min (ref exprRef_block_1)) (avg (ref exprRef_block_0))))))",
        "definesVariable": "exprRef_id_trend",
        "id": "id-trend",
        "isArtificial": undefined,
        "type": "identified-block",
      },
    ]
  `);
});
