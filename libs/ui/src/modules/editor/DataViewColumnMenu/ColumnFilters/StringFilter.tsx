import {
  Divider,
  MenuItem,
  TriggerMenuItem,
  MenuList,
} from '../../../../shared';
import { Graph } from '../../../../icons';
import { CodeResult } from '../../CodeResult/CodeResult';
import { FC, useMemo } from 'react';
import { Column, SubMenu } from '../common';
import { DataViewFilter, TableCellType } from '@decipad/editor-types';

type StringFilterProps = {
  subMenuOpened: SubMenu | false;
  setSubMenuOpened: (subMenu: SubMenu | false) => void;
  selectedFilter?: DataViewFilter;
  type: TableCellType;
  columns: Column[] | undefined;
  columnIndex: number | undefined;
  onFilterChange: (filter: DataViewFilter | undefined) => void;
};

export const StringFilter: FC<StringFilterProps> = ({
  subMenuOpened,
  setSubMenuOpened,
  selectedFilter,
  columns,
  columnIndex,
  type,
  onFilterChange,
}) => {
  const setFilter = (value: string | undefined) => {
    if (!value) {
      onFilterChange(undefined);
    } else if (selectedFilter?.operation === 'in' || selectedFilter == null) {
      const remove = selectedFilter?.valueOrValues.some(
        (v) => v.toString() === value
      );
      if (remove) {
        onFilterChange({
          operation: 'in',
          valueOrValues:
            selectedFilter?.valueOrValues?.filter(
              (v) => v.toString() !== value.toString()
            ) || [],
        });
      } else {
        onFilterChange({
          operation: 'in',
          valueOrValues: selectedFilter?.valueOrValues?.concat(value) || [
            value,
          ],
        });
      }
    }
  };

  const filterValues = useMemo(() => {
    const values = new Set(columns?.[columnIndex!].value);
    if (selectedFilter?.operation === 'in') {
      selectedFilter.valueOrValues.forEach((v) => values.add(v));
    }
    return Array.from(values);
  }, [columnIndex, columns, selectedFilter]);

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
          setFilter(undefined);
        }}
        selected={selectedFilter == null}
      >
        No Filter
      </MenuItem>
      <Divider />
      {filterValues.map((value, index) => (
        <MenuItem
          key={`filter-${index}`}
          onSelect={(e) => {
            e.preventDefault();
            setFilter(value?.toString()!);
          }}
          selected={
            (selectedFilter == null || selectedFilter.operation === 'in') &&
            selectedFilter?.valueOrValues.some(
              (v) => v.toString() === value?.toString()
            )
          }
        >
          <CodeResult value={value} type={type as any} />
        </MenuItem>
      ))}
    </MenuList>
  );
};
