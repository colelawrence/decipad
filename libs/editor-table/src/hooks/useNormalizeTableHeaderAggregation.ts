import {
  CellValueType,
  TableHeaderElement,
  useMyEditorRef,
} from '@decipad/editor-types';
import { findNodePath, setNodes } from '@udecode/plate-common';
import {
  hasAggregationId,
  translateOldToNewAggregationId,
} from '@decipad/language-aggregations';
import { useEffect } from 'react';

export const useNormalizeTableHeaderAggregation = (
  element: TableHeaderElement,
  cellType?: CellValueType
) => {
  const editor = useMyEditorRef();

  useEffect(() => {
    const { aggregation } = element;

    if (!aggregation) {
      return;
    }

    if (hasAggregationId(aggregation) || cellType == null) {
      return;
    }

    // we need to migrate the aggregation id to the new format
    const newAggregation = translateOldToNewAggregationId(
      aggregation,
      cellType
    );
    if (newAggregation) {
      const path = findNodePath(editor, element);
      if (path) {
        setNodes<TableHeaderElement>(
          editor,
          { aggregation: newAggregation },
          { at: path }
        );
      }
    }
  }, [cellType, editor, element]);
};
