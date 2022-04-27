import {
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  TableCellElement,
  TableCellType,
  TableElement,
  TableHeaderElement,
  TableHeaderRowElement,
  TableRowElement,
} from '@decipad/editor-types';
import { withPath } from '@decipad/editor-utils';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';
import { Editor, Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getColumnName } from '../utils/getColumnName';

export interface TableActions {
  onDelete: () => void;
  onChangeColumnName: (columnIndex: number, newColumnName: string) => void;
  onChangeColumnType: (
    columnIndex: number,
    newColumnType: TableCellType
  ) => void;
  onAddColumn: () => void;
  onRemoveColumn: (columnId: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIndex: string) => void;
}

export const useTableActions = (
  editor: ReactEditor,
  element: TableElement
): TableActions => {
  const onDelete = useCallback(() => {
    withPath(editor, element, (path) => {
      Transforms.delete(editor, { at: path });
    });
  }, [editor, element]);

  const onChangeColumnName = useCallback(
    (columnIndex: number, newColumnName: string) => {
      withPath(editor, element, (path) => {
        const columnHeaderPath = [...path, 1, columnIndex];
        if (Editor.hasPath(editor, columnHeaderPath)) {
          Transforms.insertText(editor, newColumnName, {
            at: path,
          });
        }
      });
    },
    [editor, element]
  );

  const onChangeColumnType = useCallback(
    (columnIndex: number, cellType: TableCellType) => {
      withPath(editor, element, (path) => {
        const columnHeaderPath = [...path, 1, columnIndex];
        if (Editor.hasPath(editor, columnHeaderPath)) {
          Transforms.setNodes<TableHeaderElement>(
            editor,
            { cellType },
            {
              at: columnHeaderPath,
            }
          );
        }
      });
    },
    [editor, element]
  );

  const onAddColumn = useCallback(() => {
    withPath(editor, element, (path) => {
      const headerRowPath = [...path, 1];
      const headerRowEntry = Editor.node(editor, headerRowPath);
      const headerRow = headerRowEntry[0] as TableHeaderRowElement;
      const columnCount = headerRow.children.length;

      const tableEntry = Editor.node(editor, path);
      const table = tableEntry[0] as TableRowElement;
      const [, , ...body] = table.children;
      const columnName = getColumnName(editor, path, columnCount + 1);
      Editor.withoutNormalizing(editor, () => {
        Transforms.insertNodes<TableHeaderElement>(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_TH,
            cellType: { kind: 'string' },
            children: [{ text: columnName }],
          } as Node,
          {
            at: [...path, 1, columnCount],
          }
        );

        body.forEach((_row, rowIndex) => {
          Transforms.insertNodes<TableCellElement>(
            editor,
            {
              id: nanoid(),
              type: ELEMENT_TD,
              cellType: { kind: 'string' },
              children: [{ text: '' }],
            } as TableCellElement,
            {
              at: [...path, rowIndex + 2, columnCount],
            }
          );
        });
      });
    });
  }, [editor, element]);

  const onRemoveColumn = useCallback(
    (columnHeaderId: string) => {
      withPath(editor, element, (path) => {
        const headerRowPath = [...path, 1];

        const columns = Array.from(Node.children(editor, headerRowPath));
        const columnIndex = columns.findIndex(
          ([column]) => (column as unknown as Element).id === columnHeaderId
        );

        if (columnIndex >= 0) {
          Editor.withoutNormalizing(editor, () => {
            const children = Array.from(Node.children(editor, path));
            children.forEach(([, childPath], childIndex) => {
              if (childIndex === 0) {
                // caption
                return;
              }
              const cellToDeletePath = [...childPath, columnIndex];
              Transforms.delete(editor, {
                at: cellToDeletePath,
              });
            });
          });
        }
      });
    },
    [editor, element]
  );

  const onAddRow = useCallback(() => {
    withPath(editor, element, (path) => {
      const headerRowPath = [...path, 1];
      const [table] = Editor.node(editor, path);
      const elementCount = (table as TableElement).children.length;
      const headerRowEntry = Editor.node(editor, headerRowPath);
      const headerRow = headerRowEntry[0] as TableHeaderRowElement;
      const columnCount = headerRow.children.length;
      const emptyCells: TableCellElement[] = Array.from(
        { length: columnCount },
        (): TableCellElement => ({
          id: nanoid(),
          type: ELEMENT_TD,
          children: [{ text: '' }],
        })
      );
      const newRow: TableRowElement = {
        id: nanoid(),
        type: ELEMENT_TR,
        children: emptyCells,
      };
      Transforms.insertNodes<TableRowElement>(editor, newRow, {
        at: [...path, elementCount],
      });
    });
  }, [editor, element]);

  const onRemoveRow = useCallback(
    (id: string) => {
      withPath(editor, element, (path) => {
        const [table] = Editor.node(editor, path);
        const rows = (table as TableElement).children;
        const rowIndex = rows.findIndex((row) => row.id === id);
        const rowPath = [...path, rowIndex];
        if (Editor.hasPath(editor, rowPath)) {
          Transforms.delete(editor, { at: rowPath });
        }
      });
    },
    [editor, element]
  );

  return {
    onDelete,
    onChangeColumnName,
    onChangeColumnType,
    onAddColumn,
    onRemoveColumn,
    onAddRow,
    onRemoveRow,
  };
};
