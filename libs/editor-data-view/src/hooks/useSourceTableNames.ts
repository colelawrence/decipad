import { useState, useEffect } from 'react';
import { AutocompleteName } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';

const namesThatLookLikeTablesOnly = (name: AutocompleteName) =>
  name.name.indexOf('.') < 0;

const isTable = (name: AutocompleteName): boolean => name.type.kind === 'table';

export const useSourceTableNames = (): AutocompleteName[] => {
  const computer = useComputer();
  const [tableNames, setTableNames] = useState<AutocompleteName[]>([]);

  useEffect(() => {
    const sub = computer.getNamesDefined$
      .observeWithSelector((names) =>
        names.filter(isTable).filter(namesThatLookLikeTablesOnly)
      )
      .subscribe(setTableNames);

    return () => sub.unsubscribe();
  }, [computer.getNamesDefined$]);

  return tableNames;
};
