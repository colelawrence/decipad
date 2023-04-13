import { AggregationKind, DataGroupElement, VirtualColumn } from '../../types';
import { generateSmartRow } from './generateSmartRow';

interface GenerateTotalGroupProps {
  columns: VirtualColumn[];
  aggregationTypes: (AggregationKind | undefined)[];
}

export const generateTotalGroup = ({
  columns,
  aggregationTypes,
}: GenerateTotalGroupProps): DataGroupElement | undefined => {
  if (!aggregationTypes.slice(1).some(Boolean)) {
    return undefined;
  }
  return {
    elementType: 'group',
    id: 'total',
    type: { kind: 'string' },
    value: 'Total',
    children: [
      generateSmartRow({
        columns: columns.slice(1),
        columnIndex: 1,
        aggregationTypes: aggregationTypes.slice(1),
        previousColumns: [],
        global: true,
        rotate: false,
      }),
    ],
    collapsible: false,
    columnIndex: -1,
    global: true,
  };
};
