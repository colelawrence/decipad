import { FC } from 'react';
import { organisms } from '@decipad/ui';
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
  <organisms.SmartRow
    {...props}
    smartCells={columns.map((column, index) => (
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
    ))}
  />
);
