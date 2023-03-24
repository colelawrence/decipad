import type { SerializedType } from '@decipad/computer';
import { css } from '@emotion/react';
import { capitalize } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { Caret, Code, Trash } from '../../icons';
import { MenuList } from '../MenuList/MenuList';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

interface Rounding {
  id: string;
  name: string;
}

export interface DataViewColumnMenuProps {
  type: SerializedType;
  selectedAggregation?: string;
  availableAggregations: Array<string>;
  availableRoundings: Array<Rounding>;
  selectedRounding?: string;
  onAggregationChange: (aggregation: string | undefined) => void;
  onRoundingChange: (aggregation: string | undefined) => void;
  onDeleteColumn: () => void;
  columnName?: string;
}

export type Ref = HTMLTableCellElement;

const triggerStyles = css({
  display: 'grid',
  alignItems: 'center',
  width: '16px',
});

type SubMenu = 'aggregate' | 'round';

export const DataViewColumnMenu: FC<DataViewColumnMenuProps> = ({
  availableAggregations,
  selectedAggregation,
  onAggregationChange,
  availableRoundings,
  selectedRounding,
  onRoundingChange,
  onDeleteColumn,
  columnName,
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
          data-test-id={`data-view-options-menu-${columnName}`}
        >
          <Caret color="normal" variant="down" />
        </button>
      }
    >
      <MenuItem onSelect={() => onDeleteColumn()} icon={<Trash />}>
        Remove column
      </MenuItem>
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
            <TriggerMenuItem icon={<Code />}>Aggregate</TriggerMenuItem>
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
                onSelect={() => onAggregationChange(availableAggregation)}
                selected={availableAggregation === selectedAggregation}
                key={index}
              >
                {capitalize(availableAggregation)}
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
          itemTrigger={<TriggerMenuItem icon={<Code />}>Round</TriggerMenuItem>}
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
    </MenuList>
  );
};
