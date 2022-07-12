import { FC } from 'react';
import { organisms } from '@decipad/ui';
import { Path } from 'slate';
import { SmartColumnCell } from '..';
import { TableColumn } from '../../hooks';

interface SmartRowProps {
  readonly tableName: string;
  readonly tablePath?: Path;
  readonly columns: TableColumn[];
  readonly selectedAggregationTypeNames: Array<string | undefined>;
  readonly onAggregationTypeChange: (
    columnIndex: number,
    aggType: string | undefined
  ) => void;
  readonly selectedSmartCellAggregationTypes?: Array<string | undefined>;
}
export const SmartRow: FC<SmartRowProps> = ({
  columns,
  selectedAggregationTypeNames,
  onAggregationTypeChange,
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
        selectedAggregationTypeName={selectedAggregationTypeNames[index]}
        onAggregationTypeChange={(agg) =>
          onAggregationTypeChange(index, agg?.name)
        }
      />
    ))}
  />
);
