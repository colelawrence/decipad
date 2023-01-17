import { getNodeEntry } from '@udecode/plate';
import { Path } from 'slate';
import {
  TableHeaderRow,
  TableRow as UITableRow,
  TableStyleContext,
} from '@decipad/ui';
import {
  ELEMENT_TR,
  PlateComponent,
  TableElement,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { assertElementType, useNodePath } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import React, { useContext, useEffect, useRef } from 'react';
import { useDndNode } from '@udecode/plate-ui-dnd';
import { useTableActions } from '../../hooks';
import { selectRow } from '../../utils/selectRow';
import { MAX_UNCOLLAPSED_TABLE_ROWS } from '../../constants';
import { useTableRowStore } from '../../contexts/tableStore';

const DRAG_ITEM_ROW = 'row';

export const TableRow: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_TR);
  const editor = getDefined(useTPlateEditorRef());
  const path = getDefined(useNodePath(element));

  const { isCollapsed } = useContext(TableStyleContext);

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
  const setRowWidth = useTableRowStore().set.rowWidth();

  const rowObserver = React.useRef(
    new ResizeObserver((rowEntries) => {
      rowEntries.forEach((rowEntry) => {
        setRowWidth(rowEntry.contentRect.width);
      });
    })
  );

  useEffect(() => {
    const currentRef = rowObserver.current;
    setDropLine(dropLine);
    // we need to calculate and store the width of the current row for the '+' button
    if (trRef.current) {
      currentRef.observe(trRef.current);
    }

    return () => currentRef.disconnect();
  }, [dropLine, setDropLine, rowObserver]);

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
