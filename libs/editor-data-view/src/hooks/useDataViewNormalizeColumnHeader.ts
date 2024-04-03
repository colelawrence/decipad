import { DataViewHeader, MyEditor } from '@decipad/editor-types';
import { RemoteComputer } from '@decipad/remote-computer';
import { findNodePath, setNodes } from '@udecode/plate-common';
import { useEffect } from 'react';
import { Subscription, debounceTime } from 'rxjs';

export const useDataViewNormalizeColumnHeader = (
  editor: MyEditor,
  computer: RemoteComputer,
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
          const columnDef = columns.find(
            (column) => column.blockId === element.name
          );
          if (!columnDef) {
            return;
          }

          if (columnDef.columnName !== element.label) {
            const path = findNodePath(editor, element);
            if (path) {
              setNodes(
                editor,
                {
                  label: columnDef.columnName,
                },
                { at: path }
              );
            }
          }
        });
    }

    return () => {
      canceled = true;
      sub?.unsubscribe();
    };
  }, [computer, editor, element, tableBlockId]);
};
