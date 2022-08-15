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
import { withPath } from '@decipad/editor-utils';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';
import {
  getNodeChildren,
  getNodeEntry,
  hasNode,
  insertNodes,
  insertText,
  moveNodes,
  removeNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { Path } from 'slate';
import { getColumnName } from '../utils';
import { changeColumnType } from '../utils/changeColumnType';
import { afterTableMenuInteraction } from '../utils/afterTableMenuInteraction';

export interface TableActions {
  onDelete: () => void;
  onChangeColumnName: (columnIndex: number, newColumnName: string) => void;
  onChangeColumnType: (
    columnIndex: number,
    newColumnType: TableCellType
  ) => void;
  onChangeColumnAggregation: (
    columnIndex: number,
    newColumnAggregation: string | undefined
  ) => void;
  onAddColumn: () => void;
  onRemoveColumn: (columnId: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIndex: string) => void;
  onMoveColumn: (fromColumnIndex: number, toColumnIndex: number) => void;
}

export const addColumn = (
  editor: MyEditor,
  {
    tablePath,
    cellType = { kind: 'string' },
  }: {
    tablePath: Path;
    cellType?: TableCellType;
  }
) => {
  const headerRowPath = [...tablePath, 1];
  const headerRowEntry = getNodeEntry<TableHeaderRowElement>(
    editor,
    headerRowPath
  );
  const headerRow = headerRowEntry[0];
  const columnCount = headerRow.children.length;

  const tableEntry = getNodeEntry<TableRowElement>(editor, tablePath);
  const table = tableEntry[0];
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

export const addRow = (editor: MyEditor, tablePath: Path) => {
  const headerRowPath = [...tablePath, 1];
  const [table] = getNodeEntry(editor, tablePath);
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
    at: [...tablePath, elementCount],
  });
};

export const useTableActions = (
  editor: MyEditor,
  element: TableElement
): TableActions => {
  const onDelete = useCallback(() => {
    withPath(editor, element, (path) => {
      withoutNormalizing(editor, () => {
        removeNodes(editor, { at: path });
        afterTableMenuInteraction(editor, path);
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

  const onChangeColumnType = useCallback(
    (columnIndex: number, cellType: TableCellType) => {
      withPath(editor, element, (path) => {
        withoutNormalizing(editor, () => {
          changeColumnType(editor, path, cellType, columnIndex);
          afterTableMenuInteraction(editor, path, columnIndex);
        });
      });
    },
    [editor, element]
  );

  const onChangeColumnAggregation = useCallback(
    (columnIndex: number, aggregation: string | undefined) => {
      withPath(editor, element, (path) => {
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
            afterTableMenuInteraction(editor, path, columnIndex);
          });
        }
      });
    },
    [editor, element]
  );

  const onAddColumn = useCallback(() => {
    withPath(editor, element, (path) => {
      withoutNormalizing(editor, () => {
        addColumn(editor, {
          tablePath: path,
        });
        afterTableMenuInteraction(editor, path);
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
              removeNodes(editor, {
                at: cellToDeletePath,
              });
              afterTableMenuInteraction(editor, path);
            });
          });
        }
      });
    },
    [editor, element]
  );

  const onAddRow = useCallback(() => {
    withPath(editor, element, (path) => {
      withoutNormalizing(editor, () => {
        addRow(editor, path);
        afterTableMenuInteraction(editor, path);
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
          withoutNormalizing(editor, () => {
            removeNodes(editor, { at: rowPath });
            afterTableMenuInteraction(editor, path);
          });
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
          afterTableMenuInteraction(editor, path, toIndex);
        });
      });
    },
    [editor, element]
  );

  return {
    onDelete,
    onChangeColumnName,
    onChangeColumnType,
    onChangeColumnAggregation,
    onAddColumn,
    onRemoveColumn,
    onAddRow,
    onRemoveRow,
    onMoveColumn,
  };
};
