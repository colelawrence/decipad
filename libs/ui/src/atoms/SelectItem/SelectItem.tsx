import { FC, ReactNode, useCallback, useState } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { useWindowListener } from '@decipad/react-utils';
import { Result } from '@decipad/computer';
import { cssVar, p14Medium } from '../../primitives';
import { Edit, Trash } from '../../icons';
import { DropdownOption } from '../../molecules';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

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
    backgroundColor: cssVar('highlightColor'),
    borderRadius: '6px',
    'aside:last-child': {
      display: 'flex',
    },
  },
});

const textStyles = css(p14Medium, {
  textAlign: 'start',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  flexGrow: 0,
});

const iconWrapper = css({
  alignItems: 'center',
  gap: '4px',
});

const iconStyles = css({
  cursor: 'pointer',
  width: 24,
  height: 24,
});

export type SelectItemTypes = 'column';
export interface SelectItems {
  item: string;
  type?: SelectItemTypes;
  focused?: boolean;
  itemValue?: Result.Result;
  icon?: ReactNode;
}

export type EditItemsOptions = {
  readonly onRemoveOption?: (a: string) => void;
  readonly onEditOption?: (a: string, b: string) => void;
  readonly onExecute: (a: string, t?: SelectItemTypes) => void;
};

type SelectItemProps = EditItemsOptions & {
  readonly item: SelectItems;
  readonly isEditAllowed?: boolean;
};

/*
 * SelectItem is a component used in SelectMenu to display a "Select" menu of options
 * This is used through parts of the application that need a dropdown in order to be
 * consist in design everywhere
 */
export const SelectItem: FC<SelectItemProps> = ({
  item,
  onExecute,
  isEditAllowed = false,
  onRemoveOption = noop,
  onEditOption = noop,
}) => {
  const [newValue, setNewValue] = useState(item.item);
  const [editing, setEditing] = useState(false);

  const keydown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === 'Escape') && editing) {
        event.preventDefault();
        event.stopPropagation();
        setEditing(false);
        onEditOption(item.item, newValue);
      }
    },
    [onEditOption, editing, item, newValue]
  );
  useWindowListener('keydown', keydown, true);

  const onExecuteItem = useCallback(() => {
    onExecute(item.item, item.type);
  }, [onExecute, item.item, item.type]);

  const onEdit = useEventNoEffect(
    useCallback(() => {
      setEditing(true);
    }, [setEditing])
  );

  const onRemove = useEventNoEffect(
    useCallback(() => {
      onRemoveOption(item.item);
    }, [item.item, onRemoveOption])
  );

  if (editing) {
    return <DropdownOption value={newValue} setValue={setNewValue} />;
  }

  return (
    <div
      css={[
        wrapper,
        item.focused && {
          backgroundColor: cssVar('highlightColor'),
          borderRadius: '6px',
        },
      ]}
      onClick={onExecuteItem}
      data-testid="dropdownOption"
    >
      <div css={{ display: 'flex', gap: '4px', maxWidth: '100%' }}>
        {item.icon && <div css={{ width: 16, height: 16 }}>{item.icon}</div>}
        <span css={textStyles}>{item.item}</span>
      </div>
      {isEditAllowed && (
        <aside css={[iconWrapper]}>
          <div css={iconStyles} onClick={onEdit}>
            <Edit />
          </div>
          <div css={[iconStyles, { width: 14, height: 14 }]} onClick={onRemove}>
            <Trash />
          </div>
        </aside>
      )}
    </div>
  );
};
