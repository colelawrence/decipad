import {
  ELEMENT_DATA_VIEW_TH,
  PlateComponent,
  DataViewElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { DataViewColumnHeader as UIDataViewColumnHeader } from '@decipad/ui';
import { getDefined } from '@decipad/utils';
import { Path } from 'slate';
import { findNodePath, getNodeEntry } from '@udecode/plate';
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
    element.id
  );
  const path = getDefined(findNodePath(editor, element));
  const dataViewPath = Path.parent(Path.parent(path));
  const [dataView] = getNodeEntry<DataViewElement>(editor, dataViewPath);
  const [{ overDirection }, connectDropTarget] = useDropColumn(
    editor,
    dataView,
    element
  );

  const onAggregationChange = useElementMutatorCallback(
    editor,
    element,
    'aggregation'
  );

  const { onDeleteColumn } = useDataView({ editor, element: dataView });

  const handleColumnDelete = () => {
    onDeleteColumn(path);
  };

  return (
    <UIDataViewColumnHeader
      name={element.name}
      type={element.cellType}
      attributes={attributes}
      selectedAggregation={element.aggregation}
      availableAggregations={[''].concat(
        availableAggregationTypesForColumnOf(element.cellType)
      )}
      onAggregationChange={onAggregationChange}
      onDeleteColumn={handleColumnDelete}
      connectDragSource={connectDragSource}
      connectDragPreview={connectDragPreview}
      connectDropTarget={connectDropTarget}
      overDirection={overDirection}
      alignRight={isCellAlignRight(element.cellType)}
    >
      {children}
    </UIDataViewColumnHeader>
  );
};
