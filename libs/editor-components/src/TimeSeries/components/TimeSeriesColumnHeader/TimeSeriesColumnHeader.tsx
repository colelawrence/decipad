import {
  useComputer,
  useDragColumn,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import type {
  TimeSeriesElement,
  PlateComponent,
  TableCellType,
} from '@decipad/editor-types';
import {
  DRAG_ITEM_DATAVIEW_COLUMN,
  ELEMENT_TIME_SERIES_TH,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  getNodeEntrySafe,
  isCellAlignRight,
} from '@decipad/editor-utils';
import { availableAggregations as getAvailableAggregations } from '@decipad/language-aggregations';
import { useDeepMemo } from '@decipad/react-utils';
import { DataViewColumnHeader as UITimeSeriesColumnHeader } from '@decipad/ui';
import { useCallback, useContext, useMemo, useRef } from 'react';
import { Path } from 'slate';
import { useTimeSeriesActions, useDropColumn } from '../../hooks';
import { useTimeSeriesNormalizeColumnHeader } from '../../hooks/useTimeSeriesNormalizeColumnHeader';
import { useTimeSeriesContext } from '../TimeSeriesContext';
import { availableRoundings } from './availableRoundings';
import { TableDndContext } from '@decipad/react-contexts';

export const TimeSeriesColumnHeader: PlateComponent<{
  overridePath?: Path;
}> = ({ attributes, children, element, overridePath }) => {
  assertElementType(element, ELEMENT_TIME_SERIES_TH);

  const editor = useMyEditorRef();
  const computer = useComputer();
  const path = useNodePath(element);

  const { columns } = useTimeSeriesContext();

  const tableDnd = useContext(TableDndContext);

  const { dragSource, dragPreview } = useDragColumn(
    editor,
    element,
    DRAG_ITEM_DATAVIEW_COLUMN,
    tableDnd.onCellDragEnd
  );

  const actualPath = overridePath ?? path;
  const timeSeries: TimeSeriesElement | undefined = useMemo(() => {
    const timeSeriesPath = actualPath && Path.parent(Path.parent(actualPath));
    return (
      timeSeriesPath &&
      (getNodeEntrySafe(editor, timeSeriesPath)?.[0] as
        | TimeSeriesElement
        | undefined)
    );
  }, [editor, actualPath]);

  const columnHeaderRef = useRef<HTMLTableCellElement>(null);

  const [{ isOverCurrent }, connectDropTarget, hoverDirection] = useDropColumn(
    editor,
    timeSeries,
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
    'TimeSeriesColumnHeader'
  );

  const { onDeleteColumn } = useTimeSeriesActions(editor, timeSeries);

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
    'TimeSeriesColumnHeader'
  );

  const onFilterChange = usePathMutatorCallback(
    editor,
    path,
    'filter',
    'TimeSeriesColumnHeader'
  );

  useTimeSeriesNormalizeColumnHeader(
    editor,
    computer,
    timeSeries?.varName,
    element
  );

  return (
    <UITimeSeriesColumnHeader
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
      rotate={timeSeries?.rotate ?? false}
      columns={columns}
      columnIndex={actualPath?.at(2)}
      onFilterChange={onFilterChange}
      selectedFilter={element.filter}
    >
      {children}
    </UITimeSeriesColumnHeader>
  );
};
