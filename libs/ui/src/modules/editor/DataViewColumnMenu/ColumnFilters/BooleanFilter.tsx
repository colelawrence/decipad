import { MenuItem, TriggerMenuItem, MenuList } from '../../../../shared';
import { Graph } from '../../../../icons';
import { FC } from 'react';
import { SubMenu, Column } from '../common';
import { DataViewFilter, TableCellType } from '@decipad/editor-types';

type BooleanFilterProps = {
  subMenuOpened: SubMenu | false;
  setSubMenuOpened: (subMenu: SubMenu | false) => void;
  selectedFilter?: DataViewFilter;
  type: TableCellType;
  columns: Column[] | undefined;
  columnIndex: number | undefined;
  onFilterChange: (filter: DataViewFilter | undefined) => void;
};
export const BooleanFilter: FC<BooleanFilterProps> = ({
  subMenuOpened,
  setSubMenuOpened,
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <MenuList
      key="filter"
      open={subMenuOpened === 'filter'}
      onChangeOpen={(open) => {
        if (open) {
          setSubMenuOpened('filter');
        }
      }}
      itemTrigger={<TriggerMenuItem icon={<Graph />}>Filter</TriggerMenuItem>}
    >
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
    </MenuList>
  );
};
