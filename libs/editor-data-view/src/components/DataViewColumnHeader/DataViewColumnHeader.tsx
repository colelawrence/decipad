import {
  ELEMENT_DATA_VIEW_TH,
  PlateComponent,
  DataViewElement,
  useTEditorRef,
  TableCellType,
} from '@decipad/editor-types';
import { assertElementType, getNodeEntrySafe } from '@decipad/editor-utils';
import { usePathMutatorCallback, useNodePath } from '@decipad/editor-hooks';
import { DataViewColumnHeader as UIDataViewColumnHeader } from '@decipad/ui';
import { Path } from 'slate';
import { useCallback, useMemo, useRef } from 'react';
import {
  columnAggregationTypes,
  isCellAlignRight,
} from '@decipad/editor-table';
import { useComputer } from '@decipad/react-contexts';
import { isFirstChild } from '@udecode/plate';
import { useDataViewActions, useDragColumn, useDropColumn } from '../../hooks';
import { availableRoundings } from './availableRoundings';

export const DataViewColumnHeader: PlateComponent<{ overridePath?: Path }> = ({
  attributes,
  children,
  element,
  overridePath,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW_TH);
  const editor = useTEditorRef();
  const [, connectDragSource, connectDragPreview] = useDragColumn(
    editor,
    element.id,
    'DataViewColumn'
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
    'DataViewColumn'
  );

  const availableAggregations = useMemo(() => {
    if (!actualPath || isFirstChild(actualPath)) {
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
    'aggregation'
  );

  const { onDeleteColumn } = useDataViewActions(editor, dataView);

  const handleColumnDelete = useCallback(() => {
    if (actualPath) {
      onDeleteColumn(actualPath);
    }
  }, [onDeleteColumn, actualPath]);

  const computer = useComputer();
  const columnName =
    computer.getColumnNameDefinedInBlock$.use(element.name) || element.name;

  // roundings
  const roundings = useMemo(
    () => (element ? availableRoundings(element.cellType) : []),
    [element]
  );
  const onRoundingChange = usePathMutatorCallback(editor, path, 'rounding');

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
      onAggregationChange={onAggregationChange as (agg?: string) => void}
      availableRoundings={roundings}
      onRoundingChange={onRoundingChange}
      selectedRounding={element.rounding}
      onDeleteColumn={handleColumnDelete}
      connectDragSource={connectDragSource}
      connectDragPreview={connectDragPreview}
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
