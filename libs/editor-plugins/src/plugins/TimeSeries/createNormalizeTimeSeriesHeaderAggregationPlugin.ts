import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import { createNormalizerPlugin } from '@decipad/editor-plugin-factories';
import type {
  MyEditor,
  MyNodeEntry,
  TimeSeriesHeader,
} from '@decipad/editor-types';
import { ELEMENT_TIME_SERIES_TH } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import {
  hasAggregationId,
  translateOldToNewAggregationId,
} from '@decipad/language-aggregations';
import type { TNodeEntry } from '@udecode/plate-common';
import { setNodes } from '@udecode/plate-common';

const normalizeTimeSeriesHeaderAggregation = (
  editor: MyEditor,
  entry: TNodeEntry<TimeSeriesHeader>
): NormalizerReturnValue => {
  const [node, path] = entry;

  const { aggregation, cellType } = node;

  if (!aggregation) {
    return false;
  }

  if (hasAggregationId(aggregation) || cellType == null) {
    return false;
  }

  // we need to migrate the aggregation id to the new format
  const newAggregation = translateOldToNewAggregationId(aggregation, cellType);
  if (newAggregation) {
    return () =>
      setNodes(editor, { aggregation: newAggregation }, { at: path });
  }

  return false;
};

const normalizeTimeSeriesPlugin =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node] = entry;
    assertElementType(node, ELEMENT_TIME_SERIES_TH);
    return normalizeTimeSeriesHeaderAggregation(
      editor,
      entry as TNodeEntry<TimeSeriesHeader>
    );
  };

export const createNormalizeTimeSeriesHeaderAggregationPlugin = () =>
  createNormalizerPlugin({
    name: 'PLUGIN_NORMALIZE_TIME_SERIES_HEADER_AGGREGATION',
    elementType: ELEMENT_TIME_SERIES_TH,
    plugin: normalizeTimeSeriesPlugin,
  });
