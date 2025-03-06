import { it, expect } from 'vitest';
import { metricNormalizer } from './metric-normalizers';
import { ELEMENT_METRIC } from '@decipad/editor-types';
import { genericEditorNormalizer } from '../to-plate-plugin';
import { createNormalizer } from '../element-normalizer';
import { createPlateEditor } from '@udecode/plate-common';

it('removes incorrect aggregations', () => {
  expect(
    metricNormalizer([
      {
        type: ELEMENT_METRIC,
        id: 'id',
        blockId: '',
        comparisonBlockId: '',
        caption: '',
        comparisonDescription: '',
        children: [{ text: '' }],

        aggregation: 'not a valid aggregation',
      },
      [0],
    ])
  ).toMatchInlineSnapshot(`
    {
      "newProperties": {},
      "path": [
        0,
      ],
      "properties": {
        "aggregation": "not a valid aggregation",
      },
      "type": "set_node",
    }
  `);
});

it('removes incorrect comparison aggregation', () => {
  expect(
    metricNormalizer([
      {
        type: ELEMENT_METRIC,
        id: 'id',
        blockId: '',
        comparisonBlockId: '',
        caption: '',
        comparisonDescription: '',
        children: [{ text: '' }],

        comparisonAggregation: 'not a valid aggregation',
      },
      [0],
    ])
  ).toMatchInlineSnapshot(`
    {
      "newProperties": {},
      "path": [
        0,
      ],
      "properties": {
        "comparisonAggregation": "not a valid aggregation",
      },
      "type": "set_node",
    }
  `);
});

it('works with an editor', () => {
  const normalizer = genericEditorNormalizer('NORMALIZE_STUFF', [
    createNormalizer(ELEMENT_METRIC, metricNormalizer),
  ]);
  const editor = createPlateEditor({ plugins: [normalizer] });

  editor.children = [
    {
      type: ELEMENT_METRIC,
      id: 'id',
      blockId: '',
      comparisonBlockId: '',
      caption: '',
      comparisonDescription: '',
      children: [{ text: '' }],

      aggregation: 'not a valid aggregation',
    },
  ];

  expect(editor.children[0]).toMatchInlineSnapshot(`
    {
      "aggregation": "not a valid aggregation",
      "blockId": "",
      "caption": "",
      "children": [
        {
          "text": "",
        },
      ],
      "comparisonBlockId": "",
      "comparisonDescription": "",
      "id": "id",
      "type": "metric",
    }
  `);

  editor.normalize({ force: true });

  expect(editor.children[0]).toMatchInlineSnapshot(`
    {
      "blockId": "",
      "caption": "",
      "children": [
        {
          "text": "",
        },
      ],
      "comparisonBlockId": "",
      "comparisonDescription": "",
      "id": "id",
      "type": "metric",
    }
  `);
});
