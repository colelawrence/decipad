import { FC } from 'react';
import { SmartRow as UISmartRow } from '@decipad/ui';
import { Path } from 'slate';
import { SmartColumnCell } from '..';
import { TableColumn } from '../../hooks';

interface SmartRowProps {
  readonly tableName: string;
  readonly tablePath?: Path;
  readonly columns: TableColumn[];
  readonly aggregationTypeNames: Array<string | undefined>;
  readonly onAggregationTypeNameChange: (
    columnIndex: number,
    aggType: string | undefined
  ) => void;
  readonly selectedSmartCellAggregationTypes?: Array<string | undefined>;
}
export const SmartRow: FC<SmartRowProps> = ({
  columns,
  aggregationTypeNames,
  onAggregationTypeNameChange,
  ...props
}) => (
  <UISmartRow
    {...props}
    smartCells={columns.map((column, index) => {
      return (
        <SmartColumnCell
          key={index}
          {...props}
          column={column}
          columnIndex={index}
          selectedAggregationTypeName={aggregationTypeNames[index]}
          onAggregationTypeNameChange={(agg) =>
            onAggregationTypeNameChange(index, agg)
          }
        />
      );
    })}
  />
);
