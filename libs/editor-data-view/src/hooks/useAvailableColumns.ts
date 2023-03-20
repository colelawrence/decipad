import { useEffect, useState } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { SerializedType } from '@decipad/computer';
import { dequal } from 'dequal';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Column } from '../types';

const DEBOUNCE_RESULT_MS = 100;

const getColumnType = (type: SerializedType): SerializedType => {
  if (type.kind === 'column') {
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
          return columns.map((column) => ({
            name: column.columnName,
            blockId: column.blockId,
            type: getColumnType(column.result.type),
            value: column.result.value,
          }));
        }),
        debounceTime(DEBOUNCE_RESULT_MS),
        distinctUntilChanged((cur, next) => dequal(cur, next))
      )
      .subscribe(setAvailableColumns);

    return () => {
      sub.unsubscribe();
    };
  }, [blockId, computer.getAllColumns$]);

  return availableColumns;
};
