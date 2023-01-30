import {
  ELEMENT_DATA_VIEW_TH,
  PlateComponent,
  DataViewElement,
  useTEditorRef,
  TableCellType,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
  useNodePath,
} from '@decipad/editor-utils';
import { DataViewColumnHeader as UIDataViewColumnHeader } from '@decipad/ui';
import { Path } from 'slate';
import { getNodeEntry, isFirstChild } from '@udecode/plate';
import { useCallback, useMemo, useRef } from 'react';
import { getDefined } from '@decipad/utils';
import {
  columnAggregationTypes,
  isCellAlignRight,
} from '@decipad/editor-table';
import { useComputer } from '@decipad/react-contexts';
import { useDataViewActions, useDragColumn, useDropColumn } from '../../hooks';

export const DataViewColumnHeader: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW_TH);
  const editor = useTEditorRef();
  const [, connectDragSource, connectDragPreview] = useDragColumn(
    editor,
    element.id,
    'DataViewColumn'
  );
  const path = getDefined(useNodePath(element));
  const dataView = useMemo(() => {
    const dataViewPath = Path.parent(Path.parent(path));
    return getNodeEntry<DataViewElement>(editor, dataViewPath)[0];
  }, [editor, path]);
  const columnHeaderRef = useRef<HTMLTableCellElement>(null);

  const [{ isOverCurrent }, connectDropTarget, hoverDirection] = useDropColumn(
    editor,
    dataView,
    element,
    columnHeaderRef,
    'DataViewColumn'
  );

  const availableAggregations = useMemo(() => {
    if (isFirstChild(path)) {
      // first column: do not present aggregation choices
      return [];
    }
    return columnAggregationTypes(element.cellType as TableCellType).map(
      (agg) => agg.name
    );
  }, [element.cellType, path]);

  const onAggregationChange = useElementMutatorCallback(
    editor,
    element,
    'aggregation'
  );

  const { onDeleteColumn } = useDataViewActions(editor, dataView);

  const handleColumnDelete = useCallback(() => {
    if (path) {
      onDeleteColumn(path);
    }
  }, [onDeleteColumn, path]);

  const computer = useComputer();
  const columnName =
    computer.getColumnNameDefinedInBlock$.use(element.name) || element.name;

  if (!columnName) {
    return null;
  }

  return (
    <UIDataViewColumnHeader
      name={columnName}
      type={element.cellType}
      attributes={attributes}
      selectedAggregation={element.aggregation}
      availableAggregations={availableAggregations}
      onAggregationChange={onAggregationChange}
      onDeleteColumn={handleColumnDelete}
      connectDragSource={connectDragSource}
      connectDragPreview={connectDragPreview}
      connectDropTarget={connectDropTarget}
      hoverDirection={hoverDirection}
      isOverCurrent={isOverCurrent}
      alignRight={isCellAlignRight(element.cellType)}
      ref={columnHeaderRef}
    >
      {children}
    </UIDataViewColumnHeader>
  );
};
