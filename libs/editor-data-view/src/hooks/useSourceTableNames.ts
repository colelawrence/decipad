import { useState, useEffect, useRef } from 'react';
import type { AutocompleteName } from '@decipad/remote-computer';
import { isTable as isComputerTable } from '@decipad/remote-computer';
import { useComputer } from '@decipad/react-contexts';
import { dequal } from '@decipad/utils';
import { debounce } from 'lodash';

const namesThatLookLikeTablesOnly = (name: AutocompleteName) =>
  name.name.indexOf('.') < 0;

const isTable = (name: AutocompleteName): boolean => isComputerTable(name.type);

export const useSourceTableNames = (): AutocompleteName[] => {
  const computer = useComputer();
  const [tableNames, setTableNames] = useState<AutocompleteName[]>([]);
  const lastTableNames = useRef(tableNames);

  useEffect(() => {
    const sub = computer.getNamesDefined$
      .observeWithSelector((names) =>
        names.filter(isTable).filter(namesThatLookLikeTablesOnly)
      )
      .subscribe(
        debounce(
          (newTableNames) => {
            if (!dequal(newTableNames, lastTableNames.current)) {
              lastTableNames.current = newTableNames;
              setTableNames(newTableNames);
            }
          },
          2000,
          { leading: true }
        )
      );

    return () => sub.unsubscribe();
  }, [computer.getNamesDefined$, tableNames]);

  return tableNames;
};
