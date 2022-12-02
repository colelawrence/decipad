import { FC, ReactNode, useCallback, useState } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { useWindowListener } from '@decipad/react-utils';
import { cssVar, p14Medium } from '../../primitives';
import { Edit, Trash } from '../../icons';
import { DropdownOption } from '../../molecules';

const wrapper = css({
  width: '100%',
  overflow: 'hidden',
  height: '32px',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  ':hover': {
    backgroundColor: cssVar('highlightColor'),
    borderRadius: '6px',
  },
});

const textStyles = css(p14Medium, {
  textAlign: 'start',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  flexGrow: 0,
});

const iconWrapper = css({
  display: 'none',
  alignItems: 'center',
  gap: '4px',
});

const iconStyles = css({
  cursor: 'pointer',
  width: 24,
  height: 24,
});

export interface SelectItems {
  item: string;
  focused: boolean;
  editing: boolean;
  icon?: ReactNode;
}

export interface SelectItemProps {
  readonly item: SelectItems;
  readonly focused: boolean;
  readonly onSelect?: (e: string) => void;
  readonly removeOption?: (o: string) => void;
  readonly editOption?: (o: string, n: string) => void;
}

/*
 * SelectItem is a component used in SelectMenu to display a "Select" menu of options
 * This is used through parts of the application that need a dropdown in order to be
 * consist in design everywhere
 */
export const SelectItem: FC<SelectItemProps> = ({
  item,
  focused,
  onSelect = noop,
  removeOption = noop,
  editOption = noop,
}) => {
  const [newValue, setNewValue] = useState(item.item);
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);

  const keydown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === 'Escape') && editing) {
        event.preventDefault();
        event.stopPropagation();
        setEditing(false);
        editOption(item.item, newValue);
      }
    },
    [editOption, editing, item, newValue]
  );
  useWindowListener('keydown', keydown, true);

  if (editing) {
    return <DropdownOption value={newValue} setValue={setNewValue} />;
  }

  return (
    <div
      css={[
        wrapper,
        focused && {
          backgroundColor: cssVar('highlightColor'),
          borderRadius: '6px',
        },
      ]}
      onClick={() => onSelect(item.item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid="dropdownOption"
    >
      <div css={{ display: 'flex', gap: '4px', maxWidth: '100%' }}>
        {item.icon && <div css={{ width: 16, height: 16 }}>{item.icon}</div>}
        <span css={textStyles}>{item.item}</span>
      </div>
      <div css={[iconWrapper, hovered && { display: 'flex' }]}>
        <div
          css={iconStyles}
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
        >
          <Edit />
        </div>
        <div
          css={[iconStyles, { width: 14, height: 14 }]}
          onClick={(e) => {
            // Prevents parent onClick from firing
            e.preventDefault();
            e.stopPropagation();
            removeOption(item.item);
          }}
        >
          <Trash />
        </div>
      </div>
    </div>
  );
};
