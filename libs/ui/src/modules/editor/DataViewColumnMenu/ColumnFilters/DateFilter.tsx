import {
  Divider,
  MenuItem,
  TriggerMenuItem,
  MenuList,
} from '../../../../shared';
import { FC, useState } from 'react';
import {
  DataViewDateOperation,
  DataViewFilter,
  TableCellType,
} from '@decipad/editor-types';
import { FilterInput } from './FilterInput';
import { Column } from '../common';

type DateFilterProps = {
  selectedFilter?: DataViewFilter;
  type: TableCellType;
  columns: Column[] | undefined;
  columnIndex: number | undefined;
  onFilterChange: (filter: DataViewFilter | undefined) => void;
};

export const DateFilter: FC<DateFilterProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  const [open, setOpen] = useState(false);
  const filterModes: Record<DataViewDateOperation, string> = {
    eq: 'Equal',
    ne: 'Not Equal',
    bt: 'Between',
  };
  const [filterMode, setFilterMode] = useState<
    DataViewDateOperation | undefined
  >(selectedFilter?.operation as DataViewDateOperation);

  const setSingleFilter = (value: string | undefined) => {
    if (value == null || filterMode == null || filterMode === 'bt') {
      return;
    }

    onFilterChange({
      operation: filterMode!,
      valueOrValues: value,
    });
  };

  const setBetweenFilter = (
    value: string | undefined,
    filter: 'from' | 'to'
  ) => {
    if (value == null || filterMode !== 'bt') {
      return;
    }

    const [from, to] = (selectedFilter?.valueOrValues || []) as [
      string,
      string
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
    <>
      <MenuList
        key="filter-date-type"
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
              setFilterMode(operation as DataViewDateOperation);
              onFilterChange({
                operation: operation as DataViewDateOperation,
              } as DataViewFilter);
            }}
            selected={filterMode === operation}
          >
            {label}
          </MenuItem>
        ))}
      </MenuList>
      {filterMode !== 'bt' && filterMode != null ? (
        <>
          <Divider />
          <FilterInput
            value={selectedFilter?.valueOrValues as string}
            inputType="date"
            onChange={(value) => setSingleFilter(value)}
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
            inputType="date"
            onChange={(value) => setBetweenFilter(value, 'from')}
            placeholder="From"
            label="From"
          />
          <FilterInput
            value={
              selectedFilter?.operation === 'bt'
                ? selectedFilter?.valueOrValues?.at(1)
                : undefined
            }
            inputType="date"
            onChange={(value) => setBetweenFilter(value, 'to')}
            placeholder="To"
            label="To"
          />
        </>
      ) : null}
    </>
  );
};
