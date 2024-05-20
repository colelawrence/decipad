/* eslint decipad/css-prop-named-variable: 0 */
import { SubMenu, Column } from '../common';
import { FC } from 'react';
import { DataViewFilter, TableCellType } from '@decipad/editor-types';
import { StringFilter } from './StringFilter';
import { NumberFilter } from './NumberFilter';
import { DateFilter } from './DateFilter';
import { BooleanFilter } from './BooleanFilter';
import {
  ExperimentalTooltip,
  MenuList,
  TriggerMenuItem,
} from 'libs/ui/src/shared';
import { ChemicalTube, Filter } from 'libs/ui/src/icons';
import { componentCssVars } from 'libs/ui/src/primitives';
import { css } from '@emotion/react';

export type DataViewColumnMenuFilterProps = {
  subMenuOpened: SubMenu | false;
  setSubMenuOpened: (subMenu: SubMenu | false) => void;
  selectedFilter?: DataViewFilter;
  type: TableCellType;
  columns: Column[] | undefined;
  columnIndex: number | undefined;
  onFilterChange: (filter: DataViewFilter | undefined) => void;
};

type FilterListProps = Pick<
  DataViewColumnMenuFilterProps,
  'subMenuOpened' | 'setSubMenuOpened'
> & {
  children: React.ReactNode;
};

const filterItemStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const experimentalTriggerStyles = css({
  height: 16,
  width: 16,
  padding: 2,
  borderRadius: 4,
  display: 'grid',
  backgroundColor: componentCssVars('RequiresPremium'),
  color: componentCssVars('RequiresPremiumText'),

  '& > svg': {
    height: '100%',
    width: '100%',
  },
});

const FilterList: React.FC<FilterListProps> = ({
  subMenuOpened,
  setSubMenuOpened,
  children,
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
      itemTrigger={
        <TriggerMenuItem icon={<Filter />}>
          <span css={filterItemStyles}>
            Filter
            <ExperimentalTooltip
              side="left"
              trigger={
                <span css={experimentalTriggerStyles}>
                  <ChemicalTube />
                </span>
              }
              title="Filter Column"
            />
          </span>
        </TriggerMenuItem>
      }
    >
      {children}
    </MenuList>
  );
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
      <FilterList {...props}>
        <StringFilter
          type={type}
          columns={columns}
          columnIndex={columnIndex}
          {...props}
        />
      </FilterList>
    );
  }

  if (type.kind === 'number') {
    return (
      <FilterList {...props}>
        <NumberFilter
          type={type}
          columns={columns}
          columnIndex={columnIndex}
          {...props}
        />
      </FilterList>
    );
  }

  if (type.kind === 'date') {
    return (
      <FilterList {...props}>
        <DateFilter
          type={type}
          columns={columns}
          columnIndex={columnIndex}
          {...props}
        />
      </FilterList>
    );
  }

  if (type.kind === 'boolean') {
    return (
      <FilterList {...props}>
        <BooleanFilter
          type={type}
          columns={columns}
          columnIndex={columnIndex}
          {...props}
        />
      </FilterList>
    );
  }
  return null;
};
