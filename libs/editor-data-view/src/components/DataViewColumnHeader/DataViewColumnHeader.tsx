import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  columnAggregationTypes,
  isCellAlignRight,
} from '@decipad/editor-table';
import {
  DataViewElement,
  ELEMENT_DATA_VIEW_TH,
  PlateComponent,
  TableCellType,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, getNodeEntrySafe } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { DataViewColumnHeader as UIDataViewColumnHeader } from '@decipad/ui';
import { DRAG_ITEM_DATAVIEW_COLUMN } from 'libs/editor-table/src/contexts/TableDndContext';
import { useDragColumn } from 'libs/editor-table/src/hooks/useDragColumn';
import { useCallback, useMemo, useRef } from 'react';
import { Path } from 'slate';
import { useDataViewActions, useDropColumn } from '../../hooks';
import { availableRoundings } from './availableRoundings';

export const DataViewColumnHeader: PlateComponent<{ overridePath?: Path }> = ({
  attributes,
  children,
  element,
  overridePath,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW_TH);
  const editor = useTEditorRef();
  const { dragSource, dragPreview } = useDragColumn(
    editor,
    element,
    DRAG_ITEM_DATAVIEW_COLUMN
  );
  const path = useNodePath(element);
  const actualPath = overridePath ?? path;
  const dataView: DataViewElement | undefined = useMemo(() => {
    const dataViewPath = actualPath && Path.parent(Path.parent(actualPath));
    return (
      dataViewPath &&
      (getNodeEntrySafe(editor, dataViewPath)?.[0] as
        | DataViewElement
        | undefined)
    );
  }, [editor, actualPath]);
  const columnHeaderRef = useRef<HTMLTableCellElement>(null);

  const [{ isOverCurrent }, connectDropTarget, hoverDirection] = useDropColumn(
    editor,
    dataView,
    element,
    columnHeaderRef,
    DRAG_ITEM_DATAVIEW_COLUMN
  );

  const availableAggregations = useMemo(() => {
    if (!actualPath) {
      // first column: do not present aggregation choices
      return [];
    }
    return columnAggregationTypes(element.cellType as TableCellType).map(
      (agg) => agg.name
    );
  }, [element.cellType, actualPath]);

  const onAggregationChange = usePathMutatorCallback(
    editor,
    path,
    'aggregation',
    'DataViewColumnHeader'
  );

  const { onDeleteColumn } = useDataViewActions(editor, dataView);

  const handleColumnDelete = useCallback(() => {
    if (actualPath) {
      onDeleteColumn(actualPath);
    }
  }, [onDeleteColumn, actualPath]);

  const computer = useComputer();

  const columnName = element.label
    ? element.label
    : computer.getColumnNameDefinedInBlock$.use(element.name) || element.name;

  // roundings
  const roundings = useMemo(
    () => (element ? availableRoundings(element.cellType) : []),
    [element]
  );
  const onRoundingChange = usePathMutatorCallback(
    editor,
    path,
    'rounding',
    'DataViewColumnHeader'
  );

  return (
    <UIDataViewColumnHeader
      name={columnName}
      type={element.cellType}
      attributes={attributes}
      selectedAggregation={element.aggregation}
      availableAggregations={availableAggregations}
      onAggregationChange={onAggregationChange as (agg?: string) => void}
      availableRoundings={roundings}
      onRoundingChange={onRoundingChange}
      selectedRounding={element.rounding}
      onDeleteColumn={handleColumnDelete}
      connectDragSource={dragSource}
      connectDragPreview={dragPreview}
      connectDropTarget={connectDropTarget}
      hoverDirection={hoverDirection}
      isOverCurrent={isOverCurrent}
      alignRight={isCellAlignRight(element.cellType)}
      ref={columnHeaderRef}
      rotate={dataView?.rotate ?? false}
    >
      {children}
    </UIDataViewColumnHeader>
  );
};
