import {
  ELEMENT_DATA_VIEW_TH,
  PlateComponent,
  DataViewElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
  useNodePath,
} from '@decipad/editor-utils';
import { DataViewColumnHeader as UIDataViewColumnHeader } from '@decipad/ui';
import { Path } from 'slate';
import { getNodeEntry } from '@udecode/plate';
import { useCallback, useMemo, useRef } from 'react';
import { getDefined } from '@decipad/utils';
import { isCellAlignRight } from 'libs/editor-table/src/components';
import { useDataView, useDragColumn, useDropColumn } from '../../hooks';
import { availableAggregationTypesForColumnOf } from '../../utils/availableAggregationTypesForColumnOf';

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

  const availableAggregations = useMemo(
    () => [''].concat(availableAggregationTypesForColumnOf(element.cellType)),
    [element.cellType]
  );

  const onAggregationChange = useElementMutatorCallback(
    editor,
    element,
    'aggregation'
  );

  const { onDeleteColumn } = useDataView({ editor, element: dataView });

  const handleColumnDelete = useCallback(() => {
    if (path) {
      onDeleteColumn(path);
    }
  }, [onDeleteColumn, path]);

  return (
    <UIDataViewColumnHeader
      name={element.name}
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
