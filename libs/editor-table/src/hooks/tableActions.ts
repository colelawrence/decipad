/* eslint-disable no-underscore-dangle */
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import type {
  MyEditor,
  MyValue,
  TableCellElement,
  TableCellType,
  TableElement,
  TableHeaderElement,
  TableHeaderRowElement,
  TableRowElement,
} from '@decipad/editor-types';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import {
  forceDownload,
  getNodeEntrySafe,
  insertNodes,
  isElementOfType,
  setSelection,
  withPath,
} from '@decipad/editor-utils';
import {
  useComputer,
  useCurrentWorkspaceStore,
  useEditorTableContext,
} from '@decipad/react-contexts';
import type { InsertNodesOptions, TEditor, Value } from '@udecode/plate-common';
import {
  getNodeChildren,
  getNodeString,
  hasNode,
  moveNodes,
  removeNodes,
  replaceNodeChildren,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { useIncrementQueryCountMutation } from '@decipad/graphql-client';
import { useToast } from '@decipad/toast';
import { nanoid } from 'nanoid';
import { useCallback, useEffect } from 'react';
import { type Path } from 'slate';
import * as Sentry from '@sentry/react';
import { exportCsv } from '@decipad/export';
import type { Result } from '@decipad/computer';
import { materializeResult } from '@decipad/computer';
import { useRdFetch } from 'libs/editor-components/src/AIPanel/hooks';
import { getColumnName, setCellText } from '../utils';
import { changeColumnType } from '../utils/changeColumnType';

export interface TableActions {
  onChangeColumnName: (columnIndex: number, newColumnName: string) => void;
  onChangeColumnType: (
    columnIndex: number,
    newColumnType?: TableCellType
  ) => void;
  onSetCollapsed: (collapsed: boolean) => void;
  onSetHideFormulas: (isHidden: boolean) => void;
  onSetHideCellFormulas: (isHidden: boolean) => void;
  onChangeColumnAggregation: (
    columnIndex: number,
    newColumnAggregation: string | undefined
  ) => void;
  onAddColumn: () => void;
  onAddColumnHere: (columnIndex: number, left?: boolean) => void;
  onRemoveColumn: (columnId: string) => void;
  onPopulateColumn: (columnId: string) => void;
  onAddRowHere: (rowNumber: number, below?: boolean) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIndex: string) => void;
  onMoveColumn: (fromColumnIndex: number, toColumnIndex: number) => void;
  onSaveIcon: (icon?: string) => void;
  onSaveColor: (color?: string) => void;
  onDownload: () => void;
}

export const addColumn = <
  TV extends Value,
  TE extends TEditor<TV> = TEditor<TV>
>(
  editor: TE,
  {
    tablePath,
    cellType = { kind: 'anything' },
    position,
  }: {
    tablePath: Path;
    cellType?: TableCellType;
    position?: number;
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
      [
        {
          id: nanoid(),
          type: ELEMENT_TH,
          cellType,
          children: [{ text: columnName }],
        },
      ],
      {
        at: [...tablePath, 1, position || columnCount],
      }
    );

    body.forEach((_row, rowIndex) => {
      insertNodes<TableCellElement>(
        editor,
        [
          {
            id: nanoid(),
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
        ],
        {
          at: [...tablePath, rowIndex + 2, position || columnCount],
        }
      );
    });
  });
};

export const addRow = <TV extends Value, TE extends TEditor<TV> = TEditor<TV>>(
  editor: TE,
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
  const onChangeColumnName = useCallback(
    (columnIndex: number, newColumnName: string) => {
      withPath(editor, element, (path) => {
        const columnHeaderPath = [...path, 1, columnIndex];
        if (hasNode(editor, columnHeaderPath)) {
          replaceNodeChildren(editor, {
            at: path,
            nodes: {
              text: newColumnName,
            },
            removeOptions: { voids: true },
          });
        }
      });
    },
    [editor, element]
  );

  const computer = useComputer();
  const path = useNodePath(element ?? undefined);

  const onSetHideFormulasMutator = usePathMutatorCallback(
    editor,
    path,
    'hideFormulas',
    'tableActions'
  );

  const onSetHideFormulas = useCallback(
    (newHideFormulas: boolean) => {
      withoutNormalizing(editor, () => {
        if (newHideFormulas) {
          // Remove selection from invisible formula input
          setSelection(editor, null);
        }
        onSetHideFormulasMutator(newHideFormulas);
      });
    },
    [editor, onSetHideFormulasMutator]
  );

  const onSetHideCellFormulas = usePathMutatorCallback(
    editor,
    path,
    'hideCellFormulas',
    'tableActions'
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

  /**
   * Action for adding column to the left or right of the current column.
   * @param left, if you want to add to the left send true, otherwise
   * it will default to adding to the right.
   */

  const onAddColumnHere = useCallback(
    (columnIndex: number, left?: boolean) => {
      if (!path) {
        return;
      }

      withoutNormalizing(editor, () => {
        addColumn(editor, {
          tablePath: path,
          position: left ? columnIndex : columnIndex + 1,
        });
      });
    },
    [editor, path]
  );

  const mutateIsCollapsed = usePathMutatorCallback(
    editor,
    path,
    'isCollapsed',
    'tableActions'
  );
  const onSetCollapsed = useCallback(
    (newValue: boolean | undefined) => {
      if (newValue === true) {
        // Prevent a crash caused by the cursor being in a table cell
        setSelection(editor, null);
      }
      mutateIsCollapsed(newValue);
    },
    [mutateIsCollapsed, editor]
  );

  const onSaveIcon = usePathMutatorCallback(
    editor,
    path,
    'icon',
    'tableActions'
  );
  const onSaveColor = usePathMutatorCallback(
    editor,
    path,
    'color',
    'tableActions'
  );

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

  const [rd, fetchRd] = useRdFetch('complete-column');
  const toast = useToast();
  const { workspaceInfo, setCurrentWorkspaceInfo } = useCurrentWorkspaceStore();
  const [, updateQueryExecCount] = useIncrementQueryCountMutation();

  const updateQueryExecutionCount = useCallback(async () => {
    return updateQueryExecCount({
      id: workspaceInfo.id || '',
    });
  }, [workspaceInfo.id, updateQueryExecCount]);

  const { setTableFrozen } = useEditorTableContext();
  // populate column
  useEffect(() => {
    try {
      switch (rd.status) {
        case 'loading': {
          setTableFrozen(true);
          return;
        }
        case 'error': {
          setTableFrozen(false);
          throw new Error(rd.error);
        }
        case 'success': {
          setTableFrozen(false);
          const suggestions = rd.result;

          const isValid =
            Array.isArray(suggestions) &&
            suggestions.every(
              (s) =>
                typeof s.id === 'string' && typeof s.suggestion === 'string'
            );

          if (!isValid) {
            throw new Error('Populate column received invalid JSON.');
          }

          if (!path) return;
          const [, , ...rows] = Array.from(getNodeChildren(editor, path));

          rows.forEach((row, i) => {
            const { id: rowId } = row[0];
            const suggestion = suggestions.find(({ id }) => rowId === id);
            if (!suggestion) return;

            const columnCellPath = [...path, i + 2, suggestion.columnIndex];
            if (hasNode(editor, columnCellPath)) {
              setCellText(editor, columnCellPath, suggestion.suggestion);
            }
          });
          return;
        }
        default: {
          setTableFrozen(false);
        }
      }
    } catch (err) {
      toast('Unable to populate column.', 'error');
      console.error('Error caught in tableActions', err);

      // We want to report an error, but it's not worth crashing the block over so
      // we're calling Sentry directly.
      Sentry.captureException(err, {
        extra: { data: rd },
      });
    }
  }, [rd, setTableFrozen, editor, path, toast]);

  const onPopulateColumn = useCallback(
    async (columnHeaderId: string) => {
      if (!path) {
        return;
      }

      // get the column header name
      const [, header, ...rows] = Array.from(getNodeChildren(editor, path));

      const headerArray = header[0].children.map((h) => {
        return (h as TableHeaderRowElement).children[0].text as string;
      });

      const columnIndex = header[0].children.findIndex(
        (a) => (a as TableHeaderRowElement).id === columnHeaderId
      );
      const columnName = headerArray[columnIndex];

      const rowsArray = rows.map((row) => {
        const { children, id: rowId } = row[0];
        const cells = children.map((cell) => {
          return (cell as TableRowElement).children[0].text as string;
        });

        return { cells, rowId };
      });

      const unpopulated = rowsArray.filter((row) => {
        return row.cells[columnIndex].trim() === '';
      });

      if (unpopulated.length === 0) {
        toast('No empty cells to populate.', 'error');
        return;
      }
      const rearranged = unpopulated;

      const body = {
        columnName,
        headerArray,
        columnIndex,
        table: rearranged,
      };

      const result = await updateQueryExecutionCount();
      const newExecutedQueryData = result.data?.incrementQueryCount;
      if (newExecutedQueryData) {
        fetchRd(body);
        setCurrentWorkspaceInfo({
          ...workspaceInfo,
          queryCount: newExecutedQueryData.queryCount,
          quotaLimit: newExecutedQueryData.quotaLimit,
        });
      }
    },
    [
      path,
      editor,
      updateQueryExecutionCount,
      toast,
      fetchRd,
      setCurrentWorkspaceInfo,
      workspaceInfo,
    ]
  );

  const onMoveColumn = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!path) {
        return;
      }
      withoutNormalizing(editor, () => {
        setSelection(editor, null);
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

  const onDownload = useCallback(async () => {
    if (element) {
      const tableName = getNodeString(element.children[0].children[0]);
      const result = computer.getBlockIdResult(element.id);
      if (
        !result ||
        result.error ||
        !result.result ||
        (result.result.type.kind !== 'materialized-table' &&
          result.result.type.kind !== 'table')
      ) {
        toast.error(
          `Cannot download table data${
            result?.error ? `: ${result.error}` : ''
          }`
        );
        return;
      }
      const rResult = await materializeResult(result.result);
      if (!rResult) {
        toast.error('Cannot download table data: no result');
        return;
      }
      const csv = exportCsv(rResult as Result.Result<'materialized-table'>);
      forceDownload(`${tableName}.csv`, new Blob([csv]));
    }
  }, [computer, element, toast]);

  return {
    onChangeColumnName,
    onChangeColumnType,
    onChangeColumnAggregation,
    onAddColumn,
    onAddColumnHere,
    onRemoveColumn,
    onPopulateColumn,
    onAddRowHere,
    onAddRow,
    onRemoveRow,
    onMoveColumn,
    onSetCollapsed,
    onSetHideFormulas,
    onSetHideCellFormulas,
    onSaveIcon,
    onSaveColor,
    onDownload,
  };
};
