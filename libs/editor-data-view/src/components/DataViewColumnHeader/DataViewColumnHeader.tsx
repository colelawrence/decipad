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
import { templates } from '@decipad/ui';
import { getDefined } from '@decipad/utils';
import { Path } from 'slate';
import { findNodePath, getNodeEntry } from '@udecode/plate';
import { isCellAlignRight } from 'libs/editor-table/src/components';
import { useDragColumn, useDropColumn } from '../../hooks';
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
  const tablePath = Path.parent(Path.parent(path));
  const [table] = getNodeEntry<DataViewElement>(editor, tablePath);
  const [{ overDirection }, connectDropTarget] = useDropColumn(
    editor,
    table,
    element
  );

  const onAggregationChange = useElementMutatorCallback(
    editor,
    element,
    'aggregation'
  );

  return (
    <templates.DataViewColumnHeader
      name={element.name}
      type={element.cellType}
      attributes={attributes}
      selectedAggregation={element.aggregation}
      availableAggregations={[''].concat(
        availableAggregationTypesForColumnOf(element.cellType)
      )}
      onAggregationChange={onAggregationChange}
      connectDragSource={connectDragSource}
      connectDragPreview={connectDragPreview}
      connectDropTarget={connectDropTarget}
      overDirection={overDirection}
      alignRight={isCellAlignRight(element.cellType)}
    >
      {children}
    </templates.DataViewColumnHeader>
  );
};
