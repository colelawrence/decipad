import { css } from '@emotion/react';
import capitalize from 'lodash.capitalize';
import { FC, useCallback, useEffect, useState } from 'react';
import { Divider, MenuItem, TriggerMenuItem, MenuList } from '../../../shared';
import { Aggregate, CaretDown, Cluster, Trash } from '../../../icons';
import { cssVar } from '../../../primitives';
import { useEventNoEffect } from '../../../utils/useEventNoEffect';
import { DataViewFilter, TableCellType } from '@decipad/editor-types';
import { DataViewColumnMenuFilter } from './ColumnFilters/DataViewColumnMenuFilter';
import { Column, SubMenu } from './common';

interface Rounding {
  id: string;
  name: string;
}

export interface DataViewColumnMenuProps {
  type: TableCellType;
  selectedAggregation?: string;
  availableAggregations: Array<{ id: string; name: string }>;
  availableRoundings: Array<Rounding>;
  selectedRounding?: string;
  onAggregationChange: (aggregation: string | undefined) => void;
  onRoundingChange: (aggregation: string | undefined) => void;
  onDeleteColumn: () => void;
  columnName?: string;
  columns: Column[] | undefined;
  columnIndex: number | undefined;
  onFilterChange: (filter: DataViewFilter | undefined) => void;
  selectedFilter?: DataViewFilter;
}

export type Ref = HTMLTableCellElement;

const triggerStyles = css({
  display: 'grid',
  alignItems: 'center',
  width: '16px',
});

export const DataViewColumnMenu: FC<DataViewColumnMenuProps> = ({
  availableAggregations,
  selectedAggregation,
  onAggregationChange,
  availableRoundings,
  selectedRounding,
  onRoundingChange,
  onDeleteColumn,
  columnName,
  columns,
  columnIndex,
  onFilterChange,
  selectedFilter,
  type,
}) => {
  const [rootMenuListOpened, setRootMenuListOpened] = useState(false);

  const onTriggerClick = useEventNoEffect(
    useCallback(() => {
      setRootMenuListOpened(!rootMenuListOpened);
    }, [rootMenuListOpened])
  );

  const [subMenuOpened, setSubMenuOpened] = useState<SubMenu | false>(false);

  useEffect(() => {
    if (!rootMenuListOpened && subMenuOpened) {
      setSubMenuOpened(false);
    }
  }, [rootMenuListOpened, subMenuOpened]);

  return (
    <MenuList
      root
      dropdown
      open={rootMenuListOpened}
      onChangeOpen={setRootMenuListOpened}
      trigger={
        <button
          css={triggerStyles}
          onClick={onTriggerClick}
          data-testid={`data-view-options-menu-${columnName}`}
        >
          <CaretDown />
        </button>
      }
    >
      {availableAggregations.length > 0 ? (
        <MenuList
          key="aggregate"
          open={subMenuOpened === 'aggregate'}
          onChangeOpen={(open) => {
            if (open) {
              setSubMenuOpened('aggregate');
            }
          }}
          itemTrigger={
            <TriggerMenuItem icon={<Aggregate />}>Aggregate</TriggerMenuItem>
          }
        >
          <MenuItem
            onSelect={() => onAggregationChange(undefined)}
            selected={selectedAggregation == null}
          >
            None
          </MenuItem>
          {availableAggregations.map((availableAggregation, index) => {
            return (
              <MenuItem
                onSelect={() => onAggregationChange(availableAggregation.id)}
                selected={availableAggregation.id === selectedAggregation}
                key={index}
              >
                {capitalize(availableAggregation.name)}
              </MenuItem>
            );
          })}
        </MenuList>
      ) : null}
      {availableRoundings.length > 0 ? (
        <MenuList
          key="round"
          open={subMenuOpened === 'round'}
          onChangeOpen={(open) => {
            if (open) {
              setSubMenuOpened('round');
            }
          }}
          itemTrigger={
            <TriggerMenuItem icon={<Cluster />}>Cluster</TriggerMenuItem>
          }
        >
          <MenuItem
            onSelect={() => onRoundingChange(undefined)}
            selected={selectedRounding == null}
          >
            None
          </MenuItem>
          {availableRoundings.map((availableRounding) => {
            return (
              <MenuItem
                onSelect={() => onRoundingChange(availableRounding.id)}
                selected={availableRounding.id === selectedRounding}
                key={availableRounding.id}
              >
                {availableRounding.name}
              </MenuItem>
            );
          })}
        </MenuList>
      ) : null}

      <DataViewColumnMenuFilter
        subMenuOpened={subMenuOpened}
        setSubMenuOpened={setSubMenuOpened}
        onFilterChange={onFilterChange}
        selectedFilter={selectedFilter}
        type={type}
        columns={columns}
        columnIndex={columnIndex}
      />

      <div role="presentation" css={hrStyles}>
        <Divider />
      </div>
      <MenuItem onSelect={onDeleteColumn} icon={<Trash />}>
        Remove column
      </MenuItem>
    </MenuList>
  );
};

const hrStyles = css({
  textOverflow: 'ellipsis',
  hr: {
    boxShadow: `0 0 0 0.5px ${cssVar('borderSubdued')}`,
  },
});
