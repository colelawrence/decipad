import { useCallback, useMemo, useRef } from 'react';
import { Path } from 'slate';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import { isCellAlignRight } from '@decipad/editor-table';
import {
  DataViewElement,
  ELEMENT_DATA_VIEW_TH,
  PlateComponent,
  TableCellType,
  useMyEditorRef,
} from '@decipad/editor-types';
import { assertElementType, getNodeEntrySafe } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { DataViewColumnHeader as UIDataViewColumnHeader } from '@decipad/ui';
import { availableAggregations as getAvailableAggregations } from '@decipad/language-aggregations';
import { DRAG_ITEM_DATAVIEW_COLUMN } from 'libs/editor-table/src/contexts/TableDndContext';
import { useDragColumn } from 'libs/editor-table/src/hooks/useDragColumn';
import { useDataViewActions, useDropColumn } from '../../hooks';
import { availableRoundings } from './availableRoundings';
import { useDataViewContext } from '../DataViewContext';
import { useDeepMemo } from '@decipad/react-utils';
import { useDataViewNormalizeColumnHeader } from '../../hooks/useDataViewNormalizeColumnHeader';

export const DataViewColumnHeader: PlateComponent<{ overridePath?: Path }> = ({
  attributes,
  children,
  element,
  overridePath,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW_TH);

  const editor = useMyEditorRef();
  const { columns } = useDataViewContext();
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
    return getAvailableAggregations(element.cellType as TableCellType);
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

  // roundings
  const roundings = useDeepMemo(
    useCallback(
      () => (element ? availableRoundings(element.cellType) : []),
      [element]
    )
  );
  const onRoundingChange = usePathMutatorCallback(
    editor,
    path,
    'rounding',
    'DataViewColumnHeader'
  );

  const onFilterChange = usePathMutatorCallback(
    editor,
    path,
    'filter',
    'DataViewColumnHeader'
  );

  useDataViewNormalizeColumnHeader(
    editor,
    useComputer(),
    dataView?.varName,
    element
  );

  return (
    <UIDataViewColumnHeader
      key={element.id}
      name={element.label}
      type={element.cellType}
      attributes={attributes}
      selectedAggregation={element.aggregation}
      availableAggregations={availableAggregations}
      onAggregationChange={onAggregationChange}
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
      columns={columns}
      columnIndex={actualPath?.at(2)}
      onFilterChange={onFilterChange}
      selectedFilter={element.filter}
    >
      {children}
    </UIDataViewColumnHeader>
  );
};
