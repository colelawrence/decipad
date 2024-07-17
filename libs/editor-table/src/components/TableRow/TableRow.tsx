import { Path } from 'slate';
import {
  TableHeaderRow,
  TableRow as UITableRow,
  TableStyleContext,
} from '@decipad/ui';
import type { PlateComponent, TableElement } from '@decipad/editor-types';
import { ELEMENT_TR, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType, getNodeEntrySafe } from '@decipad/editor-utils';
import { useNodePath } from '@decipad/editor-hooks';
import React, { useContext, useEffect, useRef } from 'react';
import { useDndNode } from '@udecode/plate-dnd';
import type { TNodeEntry } from '@udecode/plate-common';
import { useTableActions } from '../../hooks';
import { selectRow } from '../../utils/selectRow';
import { MAX_UNCOLLAPSED_TABLE_ROWS } from '../../constants';
import { useTableRowStore } from '../../contexts/tableStore';

const DRAG_ITEM_ROW = 'row';

export const TableRow: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_TR);
  const editor = useMyEditorRef();
  const path = useNodePath(element);

  const { isCollapsed } = useContext(TableStyleContext);

  const isVisible =
    path &&
    (!isCollapsed || path[path.length - 1] <= MAX_UNCOLLAPSED_TABLE_ROWS + 1);
  const tablePath = path && Path.parent(path);
  const tableEntry = tablePath
    ? (getNodeEntrySafe(editor, tablePath) as
        | TNodeEntry<TableElement>
        | undefined)
    : undefined;
  const table = tableEntry?.[0];
  const { onRemoveRow, onAddRowHere } = useTableActions(editor, table);

  const { id } = element;
  const trRef = useRef<HTMLTableRowElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { dragRef, dropLine, isDragging } = useDndNode({
    type: DRAG_ITEM_ROW,
    id: id ?? '',
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

  const firstRow = path?.[path.length - 1] === 1;
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
      onRemove={() => onRemoveRow(element.id ?? '')}
      onSelect={() => path && selectRow(editor, path)}
      onAddRowAbove={() => path && onAddRowHere(path[1])}
      onAddRowBelow={() => path && onAddRowHere(path[1], true)}
      dragRef={dragRef}
      dropLine={dropLine}
      previewRef={previewRef}
      ref={trRef}
      isBeingDragged={isDragging}
      isVisible={isVisible}
    >
      {children}
    </UITableRow>
  );
};
