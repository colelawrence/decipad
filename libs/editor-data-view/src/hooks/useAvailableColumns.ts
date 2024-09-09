import { useEffect, useState } from 'react';
import type { SerializedType } from '@decipad/language-interfaces';
import { dequal } from '@decipad/utils';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import type { Column } from '../types';
import { useComputer } from '@decipad/editor-hooks';
import { isColumn } from '@decipad/computer-utils';

const DEBOUNCE_RESULT_MS = 100;

const getColumnType = (type: SerializedType): SerializedType => {
  if (isColumn(type)) {
    return type.cellType;
  }
  return type;
};

export const useAvailableColumns = (blockId: string): Column[] | undefined => {
  const computer = useComputer();

  const [availableColumns, setAvailableColumns] = useState<
    Column[] | undefined
  >();

  useEffect(() => {
    const sub = computer.getAllColumns$
      .observe(blockId)
      .pipe(
        map((columns) => {
          return columns.map(
            (column): Column => ({
              name: column.columnName,
              blockId: column.blockId,
              type: getColumnType(column.result.type),
            })
          );
        }),
        debounceTime(DEBOUNCE_RESULT_MS),
        distinctUntilChanged((cur: Column[], next: Column[]) =>
          dequal(cur, next)
        )
      )
      .subscribe(setAvailableColumns);

    return () => {
      sub.unsubscribe();
    };
  }, [blockId, computer.getAllColumns$]);

  return availableColumns;
};
