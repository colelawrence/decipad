import { MenuItem } from '../../../../shared';
import { FC } from 'react';
import { Column } from '../common';
import { DataViewFilter, TableCellType } from '@decipad/editor-types';

type BooleanFilterProps = {
  selectedFilter?: DataViewFilter;
  type: TableCellType;
  columns: Column[] | undefined;
  columnIndex: number | undefined;
  onFilterChange: (filter: DataViewFilter | undefined) => void;
};
export const BooleanFilter: FC<BooleanFilterProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <>
      <MenuItem
        onSelect={(e) => {
          e.preventDefault();
          onFilterChange(undefined);
        }}
        selected={selectedFilter == null}
      >
        No Filter
      </MenuItem>
      <MenuItem
        onSelect={(e) => {
          e.preventDefault();
          onFilterChange({
            operation: 'eq',
            valueOrValues: true,
          });
        }}
        selected={
          selectedFilter?.operation === 'eq' &&
          selectedFilter.valueOrValues === true
        }
      >
        Is True
      </MenuItem>

      <MenuItem
        onSelect={(e) => {
          e.preventDefault();
          onFilterChange({
            operation: 'eq',
            valueOrValues: false,
          });
        }}
        selected={
          selectedFilter?.operation === 'eq' &&
          selectedFilter.valueOrValues === false
        }
      >
        Is False
      </MenuItem>
    </>
  );
};
