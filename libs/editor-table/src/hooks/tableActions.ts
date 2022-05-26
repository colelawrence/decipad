/* eslint-disable no-underscore-dangle */
import {
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  TableCellElement,
  TableCellType,
  TableElement,
  TableHeaderElement,
  TableHeaderRowElement,
  TableRowElement,
} from '@decipad/editor-types';
import { focusAndSetSelection, withPath } from '@decipad/editor-utils';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';
import {
  deleteText,
  getNode,
  getNodeChildren,
  getNodeEntry,
  hasNode,
  insertNodes,
  insertText,
  moveNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { useChangedEditorElement } from '@decipad/react-contexts';
import { getDefined } from '@decipad/utils';
import { getColumnName } from '../utils/getColumnName';
import { findTableFormulaPath } from '../utils/findTableFormulaPath';

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
  onMoveColumn: (fromColumnIndex: number, toColumnIndex: number) => void;
}

export const useTableActions = (
  editor: MyEditor,
  element: TableElement
): TableActions => {
  const waitForElement = useChangedEditorElement();

  const onDelete = useCallback(() => {
    withPath(editor, element, (path) => {
      deleteText(editor, { at: path });
    });
  }, [editor, element]);

  const onChangeColumnName = useCallback(
    (columnIndex: number, newColumnName: string) => {
      withPath(editor, element, (path) => {
        const columnHeaderPath = [...path, 1, columnIndex];
        if (hasNode(editor, columnHeaderPath)) {
          insertText(editor, newColumnName, {
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
        if (cellType.kind === 'table-formula') {
          waitForElement(
            () => {
              const table = getDefined(getNode<TableElement>(editor, path));
              return findTableFormulaPath(table, path, columnIndex);
            },
            (formulaPath) => focusAndSetSelection(editor, formulaPath)
          );
        }

        const columnHeaderPath = [...path, 1, columnIndex];
        if (hasNode(editor, columnHeaderPath)) {
          setNodes<TableHeaderElement>(
            editor,
            { cellType },
            {
              at: columnHeaderPath,
            }
          );
        }
      });
    },
    [editor, element, waitForElement]
  );

  const onAddColumn = useCallback(() => {
    withPath(editor, element, (path) => {
      const headerRowPath = [...path, 1];
      const headerRowEntry = getNodeEntry<TableHeaderRowElement>(
        editor,
        headerRowPath
      );
      const headerRow = headerRowEntry[0];
      const columnCount = headerRow.children.length;

      const tableEntry = getNodeEntry<TableRowElement>(editor, path);
      const table = tableEntry[0];
      const [, , ...body] = table.children;
      const columnName = getColumnName(editor, path, columnCount + 1);
      withoutNormalizing(editor, () => {
        insertNodes<TableHeaderElement>(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_TH,
            cellType: { kind: 'string' },
            children: [{ text: columnName }],
          },
          {
            at: [...path, 1, columnCount],
          }
        );

        body.forEach((_row, rowIndex) => {
          insertNodes<TableCellElement>(
            editor,
            {
              id: nanoid(),
              type: ELEMENT_TD,
              cellType: { kind: 'string' },
              children: [{ text: '' }],
            },
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

        const columns = Array.from(getNodeChildren(editor, headerRowPath));
        const columnIndex = columns.findIndex(
          ([column]) => (column as unknown as Element).id === columnHeaderId
        );

        if (columnIndex >= 0) {
          withoutNormalizing(editor, () => {
            const children = Array.from(getNodeChildren(editor, path));
            children.forEach(([, childPath], childIndex) => {
              if (childIndex === 0) {
                // caption
                return;
              }
              const cellToDeletePath = [...childPath, columnIndex];
              deleteText(editor, {
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
      const [table] = getNodeEntry(editor, path);
      const elementCount = (table as TableElement).children.length;
      const headerRowEntry = getNodeEntry(editor, headerRowPath);
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
      insertNodes<TableRowElement>(editor, newRow, {
        at: [...path, elementCount],
      });
    });
  }, [editor, element]);

  const onRemoveRow = useCallback(
    (id: string) => {
      withPath(editor, element, (path) => {
        const [table] = getNodeEntry(editor, path);
        const rows = (table as TableElement).children;
        const rowIndex = rows.findIndex((row) => row.id === id);
        const rowPath = [...path, rowIndex];
        if (hasNode(editor, rowPath)) {
          deleteText(editor, { at: rowPath });
        }
      });
    },
    [editor, element]
  );

  const onMoveColumn = useCallback(
    (fromIndex: number, toIndex: number) => {
      withPath(editor, element, (path) => {
        withoutNormalizing(editor, () => {
          let childIndex = -1;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const _row of getNodeChildren(editor, path)) {
            childIndex += 1;
            if (childIndex < 1) {
              // skip caption element
              continue;
            }
            const sourcePath = [...path, childIndex, fromIndex];
            const targetPath = [...path, childIndex, toIndex];
            if (hasNode(editor, sourcePath) && hasNode(editor, targetPath)) {
              moveNodes(editor, { at: sourcePath, to: targetPath });
            }
          }
        });
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
    onMoveColumn,
  };
};
