import { CSSProperties, useMemo } from 'react';
import {
  findNode,
  getBlockAbove,
  getNodeString,
  TNodeEntry,
} from '@udecode/plate';
import {
  ELEMENT_TABLE,
  TableCellElement,
  TableCellType,
  TableElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { DragColumnItem, useTable } from '@decipad/editor-table';
import {
  EditorTableContext,
  EditorTableContextValue,
} from '@decipad/react-contexts';
import {
  AvailableSwatchColor,
  EditorTable,
  TableColumnHeader,
  TableRow,
  UserIconKey,
} from '@decipad/ui';
import { DndCellPreview } from './DndCellPreview';

const previewOpacity = 0.7;

const ColumnPreview = ({
  thEntry,
  tableEntry,
  style,
}: {
  style: CSSProperties;
  thEntry: TNodeEntry<TableHeaderElement>;
  tableEntry: TNodeEntry<TableElement>;
}) => {
  const [, thPath] = thEntry;
  const [tableNode] = tableEntry;

  const colIndex = thPath[thPath.length - 1];

  const tableCells: TableCellElement[] = useMemo(() => {
    const cells = [{ type: 'caption', children: [{ text: '' }] } as any];

    tableNode.children.forEach((row, rowIndex) => {
      row.children.forEach((cell, cellIndex) => {
        if (rowIndex === 0) return;

        if (cellIndex === colIndex) {
          cells.push(cell as TableCellElement);
        }
      });
    });

    return cells;
  }, [colIndex, tableNode.children]);

  const { columns } = useTable(tableNode);

  const blockId = tableNode.id;

  const contextValue: EditorTableContextValue = useMemo(() => {
    return {
      blockId,
      cellTypes: columns.map((col) => col.cellType),
      columnBlockIds: columns.map((col) => col.blockId),
      isCollapsed: false,
    };
  }, [blockId, columns]);

  return (
    <div style={{ ...style, opacity: previewOpacity, zIndex: 1 }}>
      <EditorTableContext.Provider value={contextValue}>
        <EditorTable
          previewMode
          icon={(tableNode.icon ?? 'Table') as UserIconKey}
          color={tableNode.color as AvailableSwatchColor}
        >
          {tableCells.map((cell, index) => {
            const children = getNodeString(cell);

            return (
              <TableRow key={cell.id} previewMode>
                {index === 1 && (
                  <TableColumnHeader type={cell.cellType as TableCellType}>
                    {children}
                  </TableColumnHeader>
                )}

                {index > 1 && (
                  <DndCellPreview colIndex={colIndex} element={cell}>
                    {children}
                  </DndCellPreview>
                )}
              </TableRow>
            );
          })}
        </EditorTable>
      </EditorTableContext.Provider>
    </div>
  );
};

export const DndColumnPreview = (props: {
  item: DragColumnItem;
  style: CSSProperties;
}) => {
  const { item } = props;

  const editor = useTEditorRef();

  const thEntry = useMemo(
    () =>
      findNode<TableHeaderElement>(editor, {
        match: { id: item.id },
        at: [],
      }),
    [editor, item.id]
  );

  const tableEntry = useMemo(
    () =>
      thEntry &&
      getBlockAbove<TableElement>(editor, {
        match: { type: ELEMENT_TABLE },
        at: thEntry[1],
      }),
    [editor, thEntry]
  );

  if (!thEntry || !tableEntry) return null;

  return <ColumnPreview {...props} thEntry={thEntry} tableEntry={tableEntry} />;
};
