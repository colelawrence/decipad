import { SubMenu, Column } from '../common';
import { FC } from 'react';
import { DataViewFilter, TableCellType } from '@decipad/editor-types';
import { StringFilter } from './StringFilter';
import { NumberFilter } from './NumberFilter';
import { DateFilter } from './DateFilter';
import { BooleanFilter } from './BooleanFilter';

export type DataViewColumnMenuFilterProps = {
  subMenuOpened: SubMenu | false;
  setSubMenuOpened: (subMenu: SubMenu | false) => void;
  selectedFilter?: DataViewFilter;
  type: TableCellType;
  columns: Column[] | undefined;
  columnIndex: number | undefined;
  onFilterChange: (filter: DataViewFilter | undefined) => void;
};

export const DataViewColumnMenuFilter: FC<DataViewColumnMenuFilterProps> = ({
  type,
  columns,
  columnIndex,
  ...props
}) => {
  if (!columns || columnIndex == null || !columns[columnIndex]) {
    return null;
  }

  if (type.kind === 'string') {
    return (
      <StringFilter
        type={type}
        columns={columns}
        columnIndex={columnIndex}
        {...props}
      />
    );
  }

  if (type.kind === 'number') {
    return (
      <NumberFilter
        type={type}
        columns={columns}
        columnIndex={columnIndex}
        {...props}
      />
    );
  }

  if (type.kind === 'date') {
    return (
      <DateFilter
        type={type}
        columns={columns}
        columnIndex={columnIndex}
        {...props}
      />
    );
  }

  if (type.kind === 'boolean') {
    return (
      <BooleanFilter
        type={type}
        columns={columns}
        columnIndex={columnIndex}
        {...props}
      />
    );
  }
  return null;
};
