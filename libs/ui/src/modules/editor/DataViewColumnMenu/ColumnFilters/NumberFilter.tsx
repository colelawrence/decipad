import {
  Divider,
  MenuItem,
  TriggerMenuItem,
  MenuList,
} from '../../../../shared';
import { Graph } from '../../../../icons';
import { FC, useState } from 'react';
import {
  DataViewFilter,
  DataViewNumberOperation,
  TableCellType,
} from '@decipad/editor-types';
import { FilterInput } from './FilterInput';
import { Column, SubMenu } from '../common';

type NumberFilterProps = {
  subMenuOpened: SubMenu | false;
  setSubMenuOpened: (subMenu: SubMenu | false) => void;
  selectedFilter?: DataViewFilter;
  type: TableCellType;
  columns: Column[] | undefined;
  columnIndex: number | undefined;
  onFilterChange: (filter: DataViewFilter | undefined) => void;
};

export const NumberFilter: FC<NumberFilterProps> = ({
  subMenuOpened,
  setSubMenuOpened,
  selectedFilter,
  onFilterChange,
}) => {
  const [open, setOpen] = useState(false);
  const filterModes: Record<DataViewNumberOperation, string> = {
    eq: 'Equal',
    ne: 'Not Equal',
    bt: 'Between',
  };
  const [filterMode, setFilterMode] = useState<
    DataViewNumberOperation | undefined
  >(selectedFilter?.operation as DataViewNumberOperation);

  const setFilter = (value: number | undefined) => {
    if (filterMode == null || filterMode === 'bt') {
      return;
    }
    onFilterChange({ operation: filterMode!, valueOrValues: value });
  };

  const setBetweenFilter = (
    value: number | undefined,
    filter: 'from' | 'to'
  ) => {
    if (filterMode !== 'bt') {
      return;
    }

    const [from, to] = (selectedFilter?.valueOrValues || []) as [
      number,
      number
    ];
    if (filter === 'from') {
      onFilterChange({
        operation: 'bt',
        valueOrValues: [value, to],
      });
    } else {
      onFilterChange({
        operation: 'bt',
        valueOrValues: [from, value],
      });
    }
  };

  return (
    <MenuList
      key="filter"
      open={subMenuOpened === 'filter'}
      onChangeOpen={(o) => {
        if (o) {
          setSubMenuOpened('filter');
        }
      }}
      itemTrigger={<TriggerMenuItem icon={<Graph />}>Filter</TriggerMenuItem>}
    >
      <MenuList
        key="filter-number-type"
        open={open}
        onChangeOpen={setOpen}
        itemTrigger={
          <TriggerMenuItem>
            {(filterMode && filterModes[filterMode]) || 'No Filter'}
          </TriggerMenuItem>
        }
      >
        <MenuItem
          onSelect={(e) => {
            e.preventDefault();
            onFilterChange(undefined);
            setFilterMode(undefined);
          }}
          selected={filterMode == null}
        >
          No Filter
        </MenuItem>
        {Object.entries(filterModes).map(([operation, label]) => (
          <MenuItem
            key={operation}
            onSelect={(e) => {
              e.preventDefault();
              setFilterMode(operation as DataViewNumberOperation);
              onFilterChange({
                operation: operation as DataViewNumberOperation,
              } as DataViewFilter);
            }}
            selected={filterMode === operation}
          >
            {label}
          </MenuItem>
        ))}
      </MenuList>
      {filterMode && filterMode !== 'bt' ? (
        <>
          <Divider />
          <FilterInput
            value={selectedFilter?.valueOrValues as number}
            placeholder=""
            inputType="number"
            onChange={(value) => setFilter(Number(value))}
          />
        </>
      ) : filterMode === 'bt' ? (
        <>
          <Divider />
          <FilterInput
            value={
              selectedFilter?.operation === 'bt'
                ? selectedFilter?.valueOrValues?.at(0)
                : undefined
            }
            placeholder="From"
            label="From"
            inputType="number"
            onChange={(value) => setBetweenFilter(Number(value), 'from')}
          />
          <FilterInput
            value={
              selectedFilter?.operation === 'bt'
                ? selectedFilter?.valueOrValues?.at(1)
                : undefined
            }
            placeholder="To"
            label="To"
            inputType="number"
            onChange={(value) => setBetweenFilter(Number(value), 'to')}
          />
        </>
      ) : null}
    </MenuList>
  );
};
