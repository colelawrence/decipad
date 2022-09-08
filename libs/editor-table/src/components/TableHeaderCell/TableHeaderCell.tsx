import { useMemo } from 'react';
import {
  ELEMENT_TH,
  PlateComponent,
  TableElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { assertElementType, useNodePath } from '@decipad/editor-utils';
import { getNode, getNodeString } from '@udecode/plate';
import { Path } from 'slate';
import { useSelected } from 'slate-react';
import { getDefined } from '@decipad/utils';
import { selectColumn } from '../../utils/selectColumn';
import { useDragColumn } from '../../hooks/useDragColumn';
import {
  useColumnDropDirection,
  useDropColumn,
  useTableActions,
  useColumnInferredType,
} from '../../hooks';

export const TableHeaderCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_TH);
  const computer = useComputer();
  const editor = useTEditorRef();
  const path = getDefined(useNodePath(element));
  const nThChild = path[path.length - 1];
  const tablePath = Path.parent(Path.parent(path));
  const table = getDefined(getNode<TableElement>(editor, tablePath));
  const { onChangeColumnType, onRemoveColumn } = useTableActions(editor, table);
  const focused = useSelected();

  const { dragSource, isDragging } = useDragColumn(editor, element);
  const [{ isOver }, dropTarget] = useDropColumn(editor, element);
  const dropDirection = useColumnDropDirection(editor, element);

  const parseUnit = useMemo(
    () => computer.getUnitFromText.bind(computer),
    [computer]
  );

  const { type: inferredType } = useColumnInferredType(element);

  return (
    <organisms.TableColumnHeader
      attributes={attributes}
      readOnly={false}
      empty={getNodeString(element).length === 0}
      focused={focused}
      isFirst={nThChild === 0}
      onChangeColumnType={(newType) => onChangeColumnType(nThChild, newType)}
      onRemoveColumn={() => onRemoveColumn(element.id)}
      onSelectColumn={() => selectColumn(editor, path)}
      parseUnit={parseUnit}
      type={
        element.cellType?.kind === 'anything' ? inferredType : element.cellType
      }
      draggable={true}
      dragSource={dragSource}
      dropTarget={dropTarget}
      draggingOver={!isDragging && isOver}
      dropDirection={dropDirection}
    >
      {children}
    </organisms.TableColumnHeader>
  );
};
