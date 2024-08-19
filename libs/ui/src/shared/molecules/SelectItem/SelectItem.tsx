/* eslint decipad/css-prop-named-variable: 0 */
import { FC, ReactNode, useCallback, useState } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { useWindowListener } from '@decipad/react-utils';
import { cssVar, p14Medium } from '../../../primitives';
import { Edit, Trash } from '../../../icons';
import { DropdownOption } from '../DropdownOption/DropdownOption';
import { useEventNoEffect } from '../../../utils/useEventNoEffect';
import { CellValueType } from '@decipad/editor-types';
import type { SerializedType } from '@decipad/language-interfaces';

const wrapper = css({
  width: '100%',
  overflow: 'hidden',
  height: '32px',
  display: 'flex',
  paddingLeft: '4px',
  paddingRight: '4px',
  alignItems: 'center',
  justifyContent: 'space-between',
  ':not(:hover) aside:last-child': {
    display: 'none',
  },
  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
    borderRadius: '6px',
    'aside:last-child': {
      display: 'flex',
    },
    cursor: 'pointer',
  },
});

const textStyles = css(p14Medium, {
  textAlign: 'start',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  flexGrow: 0,
});

const iconWrapper = css({
  display: 'flex',
  backgroundColor: cssVar('backgroundDefault'),
  padding: '4px',
  alignItems: 'center',
  gap: '4px',
  position: 'absolute',
  right: '16px',
});

const iconStyles = css({
  cursor: 'pointer',
  width: 14,
  height: 14,
});

const itemIconStyles = css({
  width: '16px',
  height: '16px',
  display: 'grid',
  borderRadius: '6px',
});

const nameWrapper = css({
  display: 'flex',
  gap: '4px',
  maxWidth: '100%',
  alignItems: 'center',
});

export type SelectItemTypes = 'column';

export interface SelectItems {
  index?: number;
  item: string;
  itemName?: string;
  group?: string;
  blockId?: string;
  type?: SelectItemTypes;
  coerceToType?: CellValueType;
  icon?: ReactNode;
  blockType?: SerializedType;
}

export type EditItemsOptions = {
  readonly onRemoveOption?: (a: SelectItems) => void;
  readonly onEditOption?: (a: SelectItems, newText: string) => boolean;
  readonly onExecute: (a: SelectItems) => void;
};

type SelectItemProps = EditItemsOptions & {
  readonly item: SelectItems;
  readonly isEditAllowed?: boolean;
  readonly focusedItem?: number;
};

/*
 * SelectItem is a component used in the DropdownMenu to display a menu of options
 * This is used through parts of the application that need a dropdown in order to be
 * consist in design everywhere.
 *
 * You can extend the `SelectItems` interface to add extra functionality here.
 */
export const SelectItem: FC<SelectItemProps> = ({
  item,
  onExecute,
  focusedItem = -1,
  isEditAllowed = false,
  onRemoveOption = noop,
  onEditOption = noop,
}) => {
  const [newValue, setNewValue] = useState(item.item);
  const [editing, setEditing] = useState(false);
  const [editingError, setEditingError] = useState(false);

  const keydown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === 'Escape') && editing) {
        event.preventDefault();
        event.stopPropagation();
        const changed = onEditOption(item, newValue);
        if (changed) {
          setEditing(false);
        } else {
          setEditingError(true);
        }
      } else if (event.key === 'Enter' && item.index === focusedItem) {
        onExecute(item);
      }
    },
    [onEditOption, editing, item, newValue, focusedItem, onExecute]
  );
  useWindowListener('keydown', keydown, true);

  const onEdit = useEventNoEffect(
    useCallback(() => {
      setEditing(true);
    }, [setEditing])
  );

  const onRemove = useEventNoEffect(
    useCallback(() => {
      onRemoveOption(item);
    }, [item, onRemoveOption])
  );

  if (editing) {
    return (
      <DropdownOption
        value={newValue}
        setValue={setNewValue}
        error={editingError}
      />
    );
  }

  return (
    <div
      css={[
        wrapper,
        focusedItem === item.index && {
          backgroundColor: cssVar('backgroundDefault'),
          borderRadius: '6px',
        },
      ]}
      onClick={() => onExecute(item)}
      aria-roledescription="dropdownOption"
      data-testid="dropdown-option"
    >
      <div css={nameWrapper}>
        {item.icon && <div css={itemIconStyles}>{item.icon}</div>}
        <span css={textStyles}>{item.itemName ?? item.item}</span>
        {isEditAllowed && (
          <aside css={iconWrapper}>
            <div
              css={iconStyles}
              onClick={onEdit}
              aria-roledescription="dropdown-edit"
            >
              <Edit />
            </div>
            <div
              css={iconStyles}
              onClick={onRemove}
              aria-roledescription="dropdown-delete"
            >
              <Trash />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
