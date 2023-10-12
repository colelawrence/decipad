import {
  AutocompleteName,
  RemoteComputer,
  Result,
  isTable,
} from '@decipad/remote-computer';
import { useComputer } from '@decipad/react-contexts';
import { useEffect, useState } from 'react';

const isSourceLiveConnection = (
  computer: RemoteComputer,
  autoCompleteName: AutocompleteName
): boolean => {
  if (autoCompleteName.blockId && isTable(autoCompleteName.type)) {
    const { columnNames } = autoCompleteName.type;
    const indexOfTypeColumn = columnNames.indexOf('type');
    if (indexOfTypeColumn >= 0) {
      const result = computer.getBlockIdResult(autoCompleteName.blockId);
      return (
        (result.result as Result.Result<'materialized-table'>)?.value?.[
          indexOfTypeColumn
        ]?.[0] === 'dbconn'
      );
    }
  }
  return false;
};

export const useSourceLiveConnections = (): AutocompleteName[] => {
  const computer = useComputer();
  const [tableNames, setTableNames] = useState<AutocompleteName[]>([]);

  useEffect(() => {
    const sub = computer.getNamesDefined$
      .observeWithSelector((names) =>
        names.filter((name) => isSourceLiveConnection(computer, name))
      )
      .subscribe(setTableNames);

    return () => sub.unsubscribe();
  }, [computer, computer.getNamesDefined$]);

  return tableNames;
};
