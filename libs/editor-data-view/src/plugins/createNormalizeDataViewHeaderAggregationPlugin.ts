import type { NormalizerReturnValue } from '@decipad/editor-plugins';
import { createNormalizerPlugin } from '@decipad/editor-plugins';
import type {
  MyEditor,
  MyNodeEntry,
  DataViewHeader,
} from '@decipad/editor-types';
import { ELEMENT_DATA_VIEW_TH } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import {
  hasAggregationId,
  translateOldToNewAggregationId,
} from '@decipad/language-aggregations';
import type { TNodeEntry } from '@udecode/plate-common';
import { setNodes } from '@udecode/plate-common';

const normalizeDataViewHeaderAggregation = (
  editor: MyEditor,
  entry: TNodeEntry<DataViewHeader>
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

const normalizeDataViewPlugin =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node] = entry;
    assertElementType(node, ELEMENT_DATA_VIEW_TH);
    return normalizeDataViewHeaderAggregation(
      editor,
      entry as TNodeEntry<DataViewHeader>
    );
  };

export const createNormalizeDataViewHeaderAggregationPlugin = () =>
  createNormalizerPlugin({
    name: 'PLUGIN_NORMALIZE_DATA_VIEW_HEADER_AGGREGATION',
    elementType: ELEMENT_DATA_VIEW_TH,
    plugin: normalizeDataViewPlugin,
  });
