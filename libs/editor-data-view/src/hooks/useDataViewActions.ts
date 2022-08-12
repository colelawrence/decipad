/* eslint-disable no-underscore-dangle */
import {
  ELEMENT_DATA_VIEW_TH,
  MyEditor,
  DataViewElement,
  DataViewHeader,
  DataViewHeaderRowElement,
} from '@decipad/editor-types';
import { useElementMutatorCallback, withPath } from '@decipad/editor-utils';
import { useCallback, useMemo } from 'react';
import {
  deleteText,
  findNodePath,
  getNode,
  insertNodes,
  isText,
  setNodes,
  withoutNormalizing,
  hasNode,
  moveNodes,
  removeNodes,
} from '@udecode/plate';
import { SerializedType } from '@decipad/computer';
import { nanoid } from 'nanoid';
import { dequal } from 'dequal';
import { Observable, Subject } from 'rxjs';

interface Column {
  name: string;
  type: SerializedType;
}

export interface TableActions {
  onDelete: () => void;
  onVariableNameChange: (newName: string) => void;
  setDataColumns: (columns: Column[]) => void;
  onMoveColumn: (colIndex: number, newColIndex: number) => void;
  columnChanges$: Observable<undefined>;
}

export const useDataViewActions = (
  editor: MyEditor,
  element: DataViewElement
): TableActions => {
  const onDelete = useCallback(() => {
    withPath(editor, element, (path) => {
      deleteText(editor, { at: path });
    });
  }, [editor, element]);

  const columnChanges$ = useMemo(
    () => new Subject<undefined>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, element]
  );

  const onVariableNameChange = useElementMutatorCallback(
    editor,
    element,
    'varName'
  );

  const setDataColumns = useCallback(
    (columns: Column[]) => {
      let headerRow: DataViewHeaderRowElement | null = element.children[1];
      const headerRowPath = findNodePath(editor, headerRow);
      if (!headerRowPath) {
        return;
      }
      let existingColumns: DataViewHeader[] | undefined =
        headerRow.children.filter((node) => !isText(node));

      const refreshHeaderRow = () => {
        headerRow = getNode(editor, headerRowPath);
        existingColumns = headerRow?.children;
      };

      const maybeRemoveFirstText = () => {
        const firstHeaderRowPath = [...headerRowPath, 0];
        const firstHeaderRowChild = getNode(editor, firstHeaderRowPath);
        if (firstHeaderRowChild && isText(firstHeaderRowChild)) {
          removeNodes(editor, { at: firstHeaderRowPath });
          return true;
        }
        return false;
      };

      withoutNormalizing(editor, () => {
        if (!existingColumns) {
          return;
        }
        for (const existingColumn of existingColumns) {
          const matchingDataColumn = columns.find(
            (column) => column.name === existingColumn.name
          );
          const columnPath = findNodePath(editor, existingColumn);
          // remove columns not present
          if (!matchingDataColumn) {
            if (columnPath && hasNode(editor, columnPath)) {
              removeNodes(editor, { at: columnPath });
            }
          } else if (columnPath && hasNode(editor, columnPath)) {
            if (!dequal(existingColumn.cellType, matchingDataColumn.type)) {
              setNodes<DataViewHeader>(
                editor,
                {
                  cellType: matchingDataColumn.type,
                  aggregation: undefined,
                },
                { at: columnPath }
              );
            }
          }
        }

        // add missing columns
        refreshHeaderRow();
        if (existingColumns) {
          let nextColumnIndex = existingColumns.length;
          for (const column of columns) {
            if (maybeRemoveFirstText()) {
              refreshHeaderRow();
              nextColumnIndex = existingColumns.length;
            }

            const matchingExistingColumn = existingColumns.find(
              (existingColumn) => column.name === existingColumn.name
            );
            if (!matchingExistingColumn) {
              const headerPath = [...headerRowPath, nextColumnIndex];
              const newHeader: DataViewHeader = {
                id: nanoid(),
                type: ELEMENT_DATA_VIEW_TH,
                cellType: column.type,
                name: column.name,
                children: [{ text: '' }],
                aggregation: undefined,
              };
              insertNodes(editor, newHeader, { at: headerPath });
              nextColumnIndex += 1;
              columnChanges$.next(undefined);
            } else if (!dequal(matchingExistingColumn.cellType, column.type)) {
              const headerPath = findNodePath(editor, matchingExistingColumn);
              if (headerPath) {
                try {
                  setNodes<DataViewHeader>(
                    editor,
                    { cellType: column.type },
                    { at: headerPath }
                  );
                } catch (err) {
                  console.error('Error caught while switching columns:', err);
                }
                columnChanges$.next(undefined);
              }
            }
          }
        }
      });
    },
    [columnChanges$, editor, element.children]
  );

  const onMoveColumn = useCallback(
    (fromColIndex: number, toColIndex: number) => {
      if (fromColIndex === toColIndex) {
        return;
      }
      const headerRow = element.children[1];
      const headerRowPath = findNodePath(editor, headerRow);
      if (headerRowPath) {
        const fromPath = [...headerRowPath, fromColIndex];
        const toPath = [...headerRowPath, toColIndex];
        if (hasNode(editor, fromPath) && hasNode(editor, toPath)) {
          withoutNormalizing(editor, () => {
            moveNodes(editor, { at: fromPath, to: toPath });
          });
          columnChanges$.next(undefined);
        }
      }
    },
    [columnChanges$, editor, element.children]
  );

  return {
    onDelete,
    onVariableNameChange,
    setDataColumns,
    onMoveColumn,
    columnChanges$: columnChanges$.asObservable(),
  };
};
