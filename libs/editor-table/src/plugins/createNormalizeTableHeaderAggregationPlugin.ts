import {
  type ENodeEntry,
  setNodes,
  type Value,
  type PlateEditor,
} from '@udecode/plate-common';
import type { NormalizerReturnValue } from '@decipad/editor-plugins';
import { createNormalizerPlugin } from '@decipad/editor-plugins';
import type { TableHeaderElement } from '@decipad/editor-types';
import { ELEMENT_TH } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import {
  hasAggregationId,
  translateOldToNewAggregationId,
} from '@decipad/language-aggregations';

const normalizeTableHeaderAggregationPlugin =
  <TV extends Value, TE extends PlateEditor<TV>>(editor: TE) =>
  (entry: ENodeEntry<TV>): NormalizerReturnValue => {
    const [node, path] = entry;
    assertElementType(node, ELEMENT_TH);

    const { aggregation, cellType } = node;

    if (!aggregation) {
      return false;
    }

    if (hasAggregationId(aggregation) || cellType == null) {
      return false;
    }

    // we need to migrate the aggregation id to the new format
    const newAggregation = translateOldToNewAggregationId(
      aggregation,
      cellType
    );
    if (newAggregation) {
      return () =>
        setNodes<TableHeaderElement>(
          editor,
          { aggregation: newAggregation },
          { at: path }
        );
    }

    return false;
  };

export const createNormalizeTableHeaderAggregationPlugin = <
  TV extends Value,
  TE extends PlateEditor<TV>
>() =>
  createNormalizerPlugin<TV, TE>({
    name: 'PLUGIN_NORMALIZE_TABLE_HEADER_AGGREGATION',
    elementType: ELEMENT_TH,
    plugin: normalizeTableHeaderAggregationPlugin,
  });
