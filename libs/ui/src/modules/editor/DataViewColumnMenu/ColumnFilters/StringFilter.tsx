import { Divider, MenuItem } from '../../../../shared';
import { CodeResult } from '../../CodeResult/CodeResult';
import { type FC, useMemo } from 'react';
import type { Column } from '../common';
import type { DataViewFilter, TableCellType } from '@decipad/editor-types';

type StringFilterProps = {
  selectedFilter?: DataViewFilter;
  type: TableCellType;
  columns: Column[] | undefined;
  columnIndex: number | undefined;
  onFilterChange: (filter: DataViewFilter | undefined) => void;
};

export const StringFilter: FC<StringFilterProps> = ({
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
    <>
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
          <CodeResult value={value} type={type as any} meta={undefined} />
        </MenuItem>
      ))}
    </>
  );
};
