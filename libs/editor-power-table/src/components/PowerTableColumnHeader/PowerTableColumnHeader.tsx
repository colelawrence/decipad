import {
  ELEMENT_POWER_TH,
  PlateComponent,
  PowerTableElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { atoms } from '@decipad/ui';
import { getDefined } from '@decipad/utils';
import { Path } from 'slate';
import { findNodePath, getNodeEntry } from '@udecode/plate';
import { useDragColumn, useDropColumn } from '../../hooks';
import { availableAggregationTypesForColumnOf } from '../../utils/availableAggregationTypesForColumnOf';

export const PowerTableColumnHeader: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_POWER_TH);
  const editor = useTEditorRef();
  const [, connectDragSource, connectDragPreview] = useDragColumn(
    editor,
    element.id
  );
  const path = getDefined(findNodePath(editor, element));
  const tablePath = Path.parent(Path.parent(path));
  const [table] = getNodeEntry<PowerTableElement>(editor, tablePath);
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
    <atoms.PowerTableColumnHeader
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
    >
      {children}
    </atoms.PowerTableColumnHeader>
  );
};
