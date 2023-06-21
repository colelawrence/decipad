/* eslint-disable no-underscore-dangle */
import { SerializedType } from '@decipad/computer';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  DataViewElement,
  DataViewHeader,
  DataViewHeaderRowElement,
  ELEMENT_DATA_VIEW_TH,
  MyEditor,
} from '@decipad/editor-types';
import { insertNodes, withPath } from '@decipad/editor-utils';
import {
  deleteText,
  findNodePath,
  getNode,
  hasNode,
  isText,
  moveNodes,
  removeNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { useCallback, useMemo } from 'react';
import { Observable, Subject } from 'rxjs';
import { Path } from 'slate';
import { Column } from '../types';

export interface TableActions {
  onDelete: () => void;
  onVariableNameChange: (newName: string) => void;
  setDataColumns: (columns: Column[]) => void;
  onMoveColumn: (colIndex: number, newColIndex: number) => void;
  onInsertColumn: (
    columnName: string,
    label: string,
    serializedType: SerializedType
  ) => void;
  onDeleteColumn: (dataViewHeaderPath: Path) => void;
  columnChanges$: Observable<undefined>;
}

export const useDataViewActions = (
  editor: MyEditor,
  element: DataViewElement | undefined
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
      const headerRow: DataViewHeaderRowElement | undefined =
        element?.children[1];
      const headerRowPath = headerRow && findNodePath(editor, headerRow);
      if (!headerRowPath) {
        return;
      }
      const existingColumns: DataViewHeader[] | undefined =
        headerRow.children.filter((node) => !isText(node));

      withoutNormalizing(editor, () => {
        const setColumnTypes = () => {
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
            if (
              matchingDataColumn &&
              columnPath &&
              hasNode(editor, columnPath)
            ) {
              if (
                matchingDataColumn.type.kind !== 'anything' &&
                matchingDataColumn.type.kind !== 'type-error' &&
                existingColumn.cellType.kind !== matchingDataColumn.type.kind
              ) {
                setNodes<DataViewHeader>(
                  editor,
                  {
                    cellType: matchingDataColumn.type,
                    aggregation: undefined,
                    rounding: undefined,
                  },
                  { at: columnPath }
                );
              }
            }
          }
        };
        if (editor.withoutCapturingUndo) {
          editor.withoutCapturingUndo(setColumnTypes);
        } else {
          setColumnTypes();
        }
      });
    },
    [editor, element?.children]
  );

  const path = useNodePath(element);
  const setVarName = usePathMutatorCallback(editor, path, 'varName');

  const clearColumns = useCallback(() => {
    if (!editor.withoutCapturingUndo) {
      return;
    }
    editor.withoutCapturingUndo(() => {
      withoutNormalizing(editor, () => {
        const headerRow = element?.children[1];
        const headerRowPath = headerRow && findNodePath(editor, headerRow);
        if (!headerRowPath) {
          return;
        }
        const existingColumns: DataViewHeader[] | undefined =
          headerRow.children.filter((node) => !isText(node));
        if (!existingColumns) {
          return;
        }
        for (const existingColumn of existingColumns) {
          const columnPath = findNodePath(editor, existingColumn);
          if (columnPath && hasNode(editor, columnPath)) {
            removeNodes(editor, { at: columnPath });
          }
        }
      });
    });
  }, [editor, element?.children]);

  const onVariableNameChange = useCallback(
    (varName: string) => {
      withoutNormalizing(editor, () => {
        clearColumns();
        setVarName(varName);
      });
    },
    [clearColumns, editor, setVarName]
  );

  const onMoveColumn = useCallback(
    (fromColIndex: number, toColIndex: number) => {
      if (fromColIndex === toColIndex) {
        return;
      }
      const headerRow = element?.children[1];
      const headerRowPath = headerRow && findNodePath(editor, headerRow);
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
    [columnChanges$, editor, element?.children]
  );

  const onInsertColumn = useCallback(
    (columnName: string, label: string, serializedType: SerializedType) => {
      const headerRow = element?.children[1];
      const headerRowPath = headerRow && findNodePath(editor, headerRow);

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
          const newColumnPath = [...headerRowPath, childLength];
          insertNodes(
            editor,
            {
              id: nanoid(),
              type: ELEMENT_DATA_VIEW_TH,
              cellType: serializedType,
              label,
              name: columnName,
              children: [{ text: '' }],
            },
            { at: newColumnPath }
          );
        });
      }
    },
    [editor, element?.children]
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
    columnChanges$: useMemo(
      () => columnChanges$.asObservable(),
      [columnChanges$]
    ),
  };
};
