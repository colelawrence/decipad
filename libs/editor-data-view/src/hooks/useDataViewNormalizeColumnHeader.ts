import type { Computer } from '@decipad/computer-interfaces';
import type { DataViewHeader, MyEditor } from '@decipad/editor-types';
import { findNodePath, setNodes } from '@udecode/plate-common';
import { useEffect } from 'react';
import type { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs';

export const useDataViewNormalizeColumnHeader = (
  editor: MyEditor,
  computer: Computer,
  tableBlockId: string | undefined,
  element?: DataViewHeader
) => {
  useEffect(() => {
    let sub: Subscription;
    let canceled = false;
    if (tableBlockId && element) {
      sub = computer.getAllColumns$
        .observe(tableBlockId)
        .pipe(debounceTime(100))
        .subscribe((columns) => {
          if (canceled) {
            return;
          }
          const path = findNodePath(editor, element);
          if (!path) return;

          const columnFromName = columns.find(
            (column) => column.columnName === element.name
          );
          const blockId = columnFromName?.blockId;

          if (blockId != null) {
            setNodes(
              editor,
              {
                label: element.name,
                name: blockId,
              },
              { at: path }
            );
          }

          const columnDef = columns.find(
            (column) => column.blockId === element.name
          );
          if (!columnDef) {
            return;
          }

          //
          // this keeps column name and label in sync
          // when we start allowing users to change label
          // we need to remove this or the user will be
          // quite frustrated
          //
          if (columnDef.columnName !== element.label) {
            setNodes(
              editor,
              {
                label: columnDef.columnName,
              },
              { at: path }
            );
          }
        });
    }

    return () => {
      canceled = true;
      sub?.unsubscribe();
    };
  }, [computer, editor, element, tableBlockId]);
};
