/* eslint-disable no-underscore-dangle */
import {
  ELEMENT_POWER_TH,
  MyEditor,
  PowerTableElement,
  PowerTableHeader,
  PowerTableHeaderRowElement,
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

export const usePowerTableActions = (
  editor: MyEditor,
  element: PowerTableElement
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
      let headerRow: PowerTableHeaderRowElement | null = element.children[1];
      const headerRowPath = findNodePath(editor, headerRow);
      if (!headerRowPath) {
        return;
      }
      let existingColumns: PowerTableHeader[] | undefined =
        headerRow.children.filter((node) => !isText(node));

      const maybeRemoveFirstText = () => {
        const firstHeaderRowPath = [...headerRowPath, 0];
        const firstHeaderRowChild = getNode(editor, firstHeaderRowPath);
        if (firstHeaderRowChild && isText(firstHeaderRowChild)) {
          removeNodes(editor, { at: firstHeaderRowPath });
        }
      };

      withoutNormalizing(editor, () => {
        // remove columns not present
        if (!existingColumns) {
          return;
        }
        for (const existingColumn of existingColumns) {
          const matchingDataColumn = columns.find(
            (column) => column.name === existingColumn.name
          );
          if (!matchingDataColumn) {
            const columnPath = findNodePath(editor, existingColumn);
            if (columnPath && hasNode(editor, columnPath)) {
              removeNodes(editor, { at: columnPath });
            }
          }
        }

        // add missing columns
        headerRow = getNode(editor, headerRowPath);
        existingColumns = headerRow?.children;
        if (existingColumns) {
          let nextColumnIndex = existingColumns.length;
          for (const column of columns) {
            maybeRemoveFirstText();

            const matchingExistingColumn = existingColumns.find(
              (existingColumn) => column.name === existingColumn.name
            );
            if (!matchingExistingColumn) {
              const headerPath = [...headerRowPath, nextColumnIndex];
              const newHeader: PowerTableHeader = {
                id: nanoid(),
                type: ELEMENT_POWER_TH,
                cellType: column.type,
                name: column.name,
                children: [{ text: '' }],
              };
              insertNodes(editor, newHeader, { at: headerPath });
              nextColumnIndex += 1;
              columnChanges$.next(undefined);
            } else if (!dequal(matchingExistingColumn.cellType, column.type)) {
              const headerPath = findNodePath(editor, matchingExistingColumn);
              if (headerPath) {
                try {
                  setNodes<PowerTableHeader>(
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
