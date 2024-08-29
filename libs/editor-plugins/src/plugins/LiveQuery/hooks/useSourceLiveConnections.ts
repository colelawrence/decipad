import type { Computer } from '@decipad/computer-interfaces';
import { useComputer } from '@decipad/editor-hooks';
import type {
  AutocompleteName,
  AutocompleteNameWithSerializedType,
  Result,
} from '@decipad/language-interfaces';
import { isTable } from '@decipad/remote-computer';
import { useEffect, useState } from 'react';

const isSourceLiveConnection = (
  computer: Computer,
  autoCompleteName: AutocompleteNameWithSerializedType
): boolean => {
  if (autoCompleteName.blockId && isTable(autoCompleteName.serializedType)) {
    const { columnNames } = autoCompleteName.serializedType;
    const indexOfTypeColumn = columnNames.indexOf('type');
    if (indexOfTypeColumn >= 0) {
      const result = computer.getBlockIdResult(autoCompleteName.blockId);
      if (!result) {
        return false;
      }
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
