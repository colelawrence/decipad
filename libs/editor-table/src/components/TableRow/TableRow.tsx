import { getNodeEntry, useDndNode } from '@udecode/plate';
import { Path } from 'slate';
import { TableHeaderRow, TableRow as UITableRow } from '@decipad/ui';
import {
  ELEMENT_TR,
  PlateComponent,
  TableElement,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { assertElementType, useNodePath } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import { useEditorTableContext } from '@decipad/react-contexts';
import { useEffect, useRef } from 'react';
import { useTableActions } from '../../hooks';
import { selectRow } from '../../utils/selectRow';
import { MAX_UNCOLLAPSED_TABLE_ROWS } from '../../constants';
import { useTableRowStore } from '../../contexts/tableStore';

const DRAG_ITEM_ROW = 'row';

export const TableRow: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_TR);
  const editor = getDefined(useTPlateEditorRef());
  const path = getDefined(useNodePath(element));
  const { isCollapsed } = useEditorTableContext();
  const isVisible =
    !isCollapsed || path[path.length - 1] <= MAX_UNCOLLAPSED_TABLE_ROWS + 1;
  const tablePath = Path.parent(path);
  const [table] = getNodeEntry<TableElement>(editor, tablePath);
  const { onRemoveRow } = useTableActions(editor, table);

  const { id } = element;
  const trRef = useRef<HTMLTableRowElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { dragRef, dropLine, isDragging } = useDndNode({
    type: DRAG_ITEM_ROW,
    id,
    nodeRef: trRef,
    preview: {
      ref: previewRef,
    },
  });

  const setDropLine = useTableRowStore().set.dropLine();

  useEffect(() => {
    setDropLine(dropLine);
  }, [dropLine, setDropLine]);

  const firstRow = path[path.length - 1] === 1;
  if (firstRow) {
    return (
      <TableHeaderRow attributes={attributes} readOnly={false}>
        {children}
      </TableHeaderRow>
    );
  }
  return (
    <UITableRow
      attributes={attributes}
      readOnly={false}
      onRemove={() => onRemoveRow(element.id)}
      onSelect={() => selectRow(editor, path)}
      dragRef={dragRef}
      previewRef={previewRef}
      ref={trRef}
      isBeingDragged={isDragging}
      isVisible={isVisible}
    >
      {children}
    </UITableRow>
  );
};
