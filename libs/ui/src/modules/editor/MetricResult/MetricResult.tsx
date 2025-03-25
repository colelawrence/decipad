import { CodeResultProps } from '../../../types';
import { FC, useMemo } from 'react';
import { TableResult } from '../TableResult/TableResult';
import { MaterializedTable, Table } from '@decipad/language-interfaces';
import { isResultGenerator } from '@decipad/language-types';

export const MetricResult: FC<CodeResultProps<'metric'>> = ({
  type,
  ...props
}) => {
  const isTable = isResultGenerator(props.value[0]);
  const tableType = useMemo(
    (): Table | MaterializedTable => ({
      kind: isTable ? 'table' : 'materialized-table',
      columnNames: ['Date', 'Value'],
      columnTypes: [{ kind: 'date', date: type.granularity }, type.valueType],
      indexName: null,
    }),
    [isTable, type.granularity, type.valueType]
  );
  const result = useMemo(
    () =>
      ({
        ...props,
        type: tableType,
      } as CodeResultProps<'table'>),
    [props, tableType]
  );
  return <TableResult {...result} />;
};
