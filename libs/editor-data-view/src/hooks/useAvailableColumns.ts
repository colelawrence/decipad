import { useEffect, useState } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { SerializedType, isColumn } from '@decipad/computer';
import { dequal } from '@decipad/utils';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { Column, ImmaterializedColumn } from '../types';
import { materializeColumn } from '../utils/materializeColumn';

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
            (column): ImmaterializedColumn => ({
              name: column.columnName,
              blockId: column.blockId,
              type: getColumnType(column.result.type),
              value: column.result.value,
            })
          );
        }),
        debounceTime(DEBOUNCE_RESULT_MS),
        distinctUntilChanged(
          (cur: ImmaterializedColumn[], next: ImmaterializedColumn[]) =>
            dequal(cur, next)
        ),
        switchMap((columns: ImmaterializedColumn[]): Promise<Column[]> => {
          const materializedColumns = columns.map(
            materializeColumn
          ) as Promise<Column>[];
          return Promise.all(materializedColumns);
        })
      )
      .subscribe(setAvailableColumns);

    return () => {
      sub.unsubscribe();
    };
  }, [blockId, computer.getAllColumns$]);

  return availableColumns;
};
