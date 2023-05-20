/* eslint-disable no-underscore-dangle */
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  MyValue,
  TableCellElement,
  TableCellType,
  TableElement,
  TableHeaderElement,
  TableRowElement,
} from '@decipad/editor-types';
import {
  getNodeEntrySafe,
  insertNodes,
  isElementOfType,
  withPath,
} from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import {
  InsertNodesOptions,
  getNodeChildren,
  hasNode,
  insertText,
  moveNodes,
  removeNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';
import { BaseEditor, Path, Transforms } from 'slate';
import { getColumnName } from '../utils';
import { changeColumnType } from '../utils/changeColumnType';

export interface TableActions {
  onDelete: () => void;
  onChangeColumnName: (columnIndex: number, newColumnName: string) => void;
  onChangeColumnType: (
    columnIndex: number,
    newColumnType?: TableCellType
  ) => void;
  onSetCollapsed: (collapsed: boolean) => void;
  onSetHideFormulas: (isHidden: boolean) => void;
  onChangeColumnAggregation: (
    columnIndex: number,
    newColumnAggregation: string | undefined
  ) => void;
  onAddColumn: () => void;
  onRemoveColumn: (columnId: string) => void;
  onAddRowHere: (rowNumber: number, below?: boolean) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIndex: string) => void;
  onMoveColumn: (fromColumnIndex: number, toColumnIndex: number) => void;
  onSaveIcon: (icon?: string) => void;
  onSaveColor: (color?: string) => void;
}

export const addColumn = (
  editor: MyEditor,
  {
    tablePath,
    cellType = { kind: 'anything' },
  }: {
    tablePath: Path;
    cellType?: TableCellType;
  }
) => {
  const headerRowPath = [...tablePath, 1];
  const headerRowEntry = getNodeEntrySafe(editor, headerRowPath);
  const headerRow = headerRowEntry?.[0];
  if (!isElementOfType(headerRow, ELEMENT_TR)) {
    return;
  }
  const columnCount = headerRow?.children.length;

  const tableEntry = getNodeEntrySafe(editor, tablePath);
  const table = tableEntry?.[0];
  if (!isElementOfType(table, ELEMENT_TABLE)) {
    return;
  }
  const [, , ...body] = table.children;
  const columnName = getColumnName(editor, tablePath, columnCount + 1);
  withoutNormalizing(editor, () => {
    insertNodes<TableHeaderElement>(
      editor,
      {
        id: nanoid(),
        type: ELEMENT_TH,
        cellType,
        children: [{ text: columnName }],
      },
      {
        at: [...tablePath, 1, columnCount],
      }
    );

    body.forEach((_row, rowIndex) => {
      insertNodes<TableCellElement>(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_TD,
          children: [{ text: '' }],
        },
        {
          at: [...tablePath, rowIndex + 2, columnCount],
        }
      );
    });
  });
};

export const addRow = (
  editor: MyEditor,
  tablePath: Path,
  options?: InsertNodesOptions<MyValue>
) => {
  const headerRowPath = [...tablePath, 1];
  const tableEntry = getNodeEntrySafe(editor, tablePath);
  if (!tableEntry) {
    return;
  }
  const [table] = tableEntry;
  if (!isElementOfType(table, ELEMENT_TABLE)) {
    return;
  }
  const elementCount = table.children.length;
  const headerRowEntry = getNodeEntrySafe(editor, headerRowPath);
  if (!headerRowEntry) {
    return;
  }
  const headerRow = headerRowEntry[0];
  if (!isElementOfType(headerRow, ELEMENT_TR)) {
    return;
  }
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

  // @ts-ignore
  insertNodes<TableRowElement>(editor, newRow, {
    at: [...tablePath, elementCount],
    ...options,
  });
};

export const useTableActions = (
  editor: MyEditor,
  element: TableElement | null | undefined
): TableActions => {
  const onDelete = useCallback(() => {
    withPath(editor, element, (path) => {
      withoutNormalizing(editor, () => {
        removeNodes(editor, { at: path });
      });
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

  const computer = useComputer();

  const path = useNodePath(element ?? undefined);
  const onSetHideFormulas = usePathMutatorCallback(
    editor,
    path,
    'hideFormulas'
  );

  const onChangeColumnType = useCallback(
    (columnIndex: number, cellType?: TableCellType) => {
      withoutNormalizing(editor, () => {
        onSetHideFormulas(false);
        if (path) {
          changeColumnType(editor, path, cellType, columnIndex, computer);
        }
      });
    },
    [editor, onSetHideFormulas, path, computer]
  );

  const onChangeColumnAggregation = useCallback(
    (columnIndex: number, aggregation: string | undefined) => {
      if (!path) {
        return;
      }
      const columnHeaderPath = [...path, 1, columnIndex];
      if (hasNode(editor, columnHeaderPath)) {
        withoutNormalizing(editor, () => {
          setNodes<TableHeaderElement>(
            editor,
            { aggregation },
            {
              at: columnHeaderPath,
            }
          );
        });
      }
    },
    [editor, path]
  );

  const onAddColumn = useCallback(() => {
    if (!path) {
      return;
    }
    withoutNormalizing(editor, () => {
      addColumn(editor, {
        tablePath: path,
      });
    });
  }, [editor, path]);

  // here is the crash i think
  const mutateIsCollapsed = usePathMutatorCallback(editor, path, 'isCollapsed');
  const onSetCollapsed = useCallback(
    (newValue: boolean | undefined) => {
      if (newValue === true) {
        // Prevent a crash caused by the cursor being in a table cell
        Transforms.deselect(editor as BaseEditor);
      }
      mutateIsCollapsed(newValue);
    },
    [mutateIsCollapsed, editor]
  );

  const onSaveIcon = usePathMutatorCallback(editor, path, 'icon');
  const onSaveColor = usePathMutatorCallback(editor, path, 'color');

  const onRemoveColumn = useCallback(
    (columnHeaderId: string) => {
      if (!path) {
        return;
      }
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
            removeNodes(editor, {
              at: cellToDeletePath,
            });
          });
        });
      }
    },
    [editor, path]
  );

  /**
   * Action for adding row above or below the current row.
   * @param above, if you want to add below send true, otherwise
   * it will default to adding above.
   */
  const onAddRowHere = useCallback(
    (rowNumber: number, below?: boolean) => {
      if (!path) {
        return;
      }
      withoutNormalizing(editor, () => {
        addRow(editor, path, {
          at: [...path, below ? rowNumber + 1 : rowNumber],
        });
      });
    },
    [editor, path]
  );

  const onAddRow = useCallback(() => {
    if (!path) {
      return;
    }
    withoutNormalizing(editor, () => {
      addRow(editor, path);
    });
  }, [editor, path]);

  const onRemoveRow = useCallback(
    (id: string) => {
      if (!path) {
        return;
      }
      const tableEntry = getNodeEntrySafe(editor, path);
      if (!tableEntry) {
        return;
      }
      const [table] = tableEntry;
      const rows = (table as TableElement).children;
      const rowIndex = rows.findIndex((row) => row.id === id);
      const rowPath = [...path, rowIndex];
      if (hasNode(editor, rowPath)) {
        withoutNormalizing(editor, () => {
          removeNodes(editor, { at: rowPath });
        });
      }
    },
    [editor, path]
  );

  const onMoveColumn = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!path) {
        return;
      }
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
    },
    [editor, path]
  );

  return {
    onDelete,
    onChangeColumnName,
    onChangeColumnType,
    onChangeColumnAggregation,
    onAddColumn,
    onRemoveColumn,
    onAddRowHere,
    onAddRow,
    onRemoveRow,
    onMoveColumn,
    onSetCollapsed,
    onSetHideFormulas,
    onSaveIcon,
    onSaveColor,
  };
};
