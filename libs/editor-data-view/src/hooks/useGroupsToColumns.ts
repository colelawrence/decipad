import { useEffect, useState } from 'react';
import { AggregationKind, Column, DataGroup } from '../types';
import { groupsToColumns } from '../utils/groupsToColumns';
import { RemoteComputer } from '@decipad/remote-computer';

interface UseGroupsToColumnsOptions {
  computer: RemoteComputer;
  tableName?: string;
  groups: DataGroup[];
  aggregationTypes: (AggregationKind | undefined)[];
  roundings: Array<string | undefined>;
}

export const useGroupsToColumns = ({
  computer,
  tableName,
  groups,
  aggregationTypes,
  roundings,
}: UseGroupsToColumnsOptions): Column[] => {
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      const newColumns = await groupsToColumns({
        computer,
        tableName,
        groups,
        aggregationTypes,
        roundings,
      });
      if (!canceled) {
        setColumns(newColumns);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [aggregationTypes, computer, groups, roundings, tableName]);

  return columns;
};
