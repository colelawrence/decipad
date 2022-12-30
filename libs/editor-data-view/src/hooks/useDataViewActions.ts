/* eslint-disable no-underscore-dangle */
import {
  ELEMENT_DATA_VIEW_TH,
  MyEditor,
  DataViewElement,
  DataViewHeader,
  DataViewHeaderRowElement,
} from '@decipad/editor-types';
import {
  useElementMutatorCallback,
  withPath,
  insertNodes,
} from '@decipad/editor-utils';
import { useCallback, useMemo } from 'react';
import {
  deleteText,
  findNodePath,
  getNode,
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
import { Path } from 'slate';
import { Column } from '../types';

export interface TableActions {
  onDelete: () => void;
  onVariableNameChange: (newName: string) => void;
  setDataColumns: (columns: Column[]) => void;
  onMoveColumn: (colIndex: number, newColIndex: number) => void;
  onInsertColumn: (columnName: string, serializedType: SerializedType) => void;
  onDeleteColumn: (dataViewHeaderPath: Path) => void;
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

  const setDataColumns = useCallback(
    (columns: Column[]) => {
      const headerRow: DataViewHeaderRowElement | null = element.children[1];
      const headerRowPath = findNodePath(editor, headerRow);
      if (!headerRowPath) {
        return;
      }
      const existingColumns: DataViewHeader[] | undefined =
        headerRow.children.filter((node) => !isText(node));

      withoutNormalizing(editor, () => {
        if (!existingColumns) {
          return;
        }
        for (const existingColumn of existingColumns) {
          const matchingDataColumn = columns.find((column) =>
            column.blockId != null
              ? column.blockId === existingColumn.name
              : column.name === existingColumn.name
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
      });
    },
    [editor, element.children]
  );

  const setVarName = useElementMutatorCallback(editor, element, 'varName');

  const onVariableNameChange = useCallback(
    (varName: string) => {
      setDataColumns([]);
      setVarName(varName);
    },
    [setDataColumns, setVarName]
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

  const onInsertColumn = useCallback(
    (columnName: string, serializedType: SerializedType) => {
      const headerRow = element.children[1];
      const headerRowPath = findNodePath(editor, headerRow);

      if (headerRowPath) {
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
          let childLength = headerRow.children.length;
          if (maybeRemoveFirstText()) {
            childLength -= 1;
          }
          const path = [...headerRowPath, childLength];
          insertNodes(
            editor,
            {
              id: nanoid(),
              type: ELEMENT_DATA_VIEW_TH,
              cellType: serializedType,
              name: columnName,
              children: [{ text: '' }],
            },
            { at: path }
          );
        });
      }
    },
    [editor, element.children]
  );

  const onDeleteColumn = useCallback(
    (dataViewHeaderPath: Path) => {
      removeNodes(editor, { at: dataViewHeaderPath });
    },
    [editor]
  );

  return {
    onDelete,
    onVariableNameChange,
    setDataColumns,
    onMoveColumn,
    onInsertColumn,
    onDeleteColumn,
    columnChanges$: columnChanges$.asObservable(),
  };
};
