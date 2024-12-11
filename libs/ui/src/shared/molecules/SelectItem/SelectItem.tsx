/* eslint decipad/css-prop-named-variable: 0 */
import { FC, ReactNode, useCallback, useState } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { useWindowListener } from '@decipad/react-utils';
import { cssVar, p14Medium } from '../../../primitives';
import { Edit, Trash } from '../../../icons';
import { DropdownEditOption } from '../DropdownEditOption/DropdownEditOption';
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
  textOverflow: 'ellipsis',
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
  flexShrink: 0,
});

const nameWrapper = css({
  display: 'flex',
  gap: '4px',
  maxWidth: '100%',
  alignItems: 'center',
});

export type SelectItemTypes = 'column';

export interface SelectItems {
  id: string;
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
  readonly focused?: boolean;
  readonly selected?: boolean;
};

export const selectItemDOMId = (id: string) => `select-item-${id}`;

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
  focused = false,
  selected = false,
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
      } else if (event.key === 'Enter' && focused) {
        onExecute(item);
      }
    },
    [onEditOption, editing, item, newValue, focused, onExecute]
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
      <DropdownEditOption
        value={newValue}
        setValue={setNewValue}
        error={editingError}
      />
    );
  }

  const text = item.itemName ?? item.item;

  return (
    <div
      css={[
        wrapper,
        focused && {
          backgroundColor: cssVar('backgroundDefault'),
          borderRadius: '6px',
        },
      ]}
      onClick={() => onExecute(item)}
      data-testid="dropdown-option"
      role="option"
      id={selectItemDOMId(item.id)}
      aria-selected={selected}
      aria-label={text}
    >
      <div css={nameWrapper}>
        {item.icon && <div css={itemIconStyles}>{item.icon}</div>}
        <span css={textStyles} title={text}>
          {text}
        </span>
        {isEditAllowed && (
          <aside css={iconWrapper}>
            <button
              type="button"
              css={iconStyles}
              onClick={onEdit}
              data-testid="dropdown-edit"
            >
              <Edit />
            </button>
            <button
              type="button"
              css={iconStyles}
              onClick={onRemove}
              data-testid="dropdown-delete"
            >
              <Trash />
            </button>
          </aside>
        )}
      </div>
    </div>
  );
};
