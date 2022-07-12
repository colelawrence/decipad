import { css } from '@emotion/react';
import { useCallback, useState } from 'react';
import { Caret } from '../../icons';
import { MenuList } from '../../molecules';
import { p12Regular } from '../../primitives';
import { MenuItem } from '../MenuItem/MenuItem';

const selectWrapperStyles = css({
  position: 'relative',
});

const menuListWrapperStyles = css({
  marginLeft: 'auto',
  position: 'absolute',
});

const itemStyles = css(p12Regular, {
  textAlign: 'right',
  whiteSpace: 'nowrap',
});

const triggerStyles = css({
  display: 'grid',
  alignItems: 'center',
  width: '16px',
  marginTop: '0.55rem',
});

interface SelectProps<T extends string> {
  variant?: 'transparent';
  caretColor?: 'weak' | 'normal';
  options: T[];
  value?: T;
  onChange: (newSelected: T) => void;
}

export function Select<T extends string>({
  options,
  value,
  onChange,
  caretColor = 'normal',
}: SelectProps<T>) {
  const [opened, setOpened] = useState(false);
  const onTriggerClick = useCallback(() => {
    setOpened(!opened);
  }, [opened]);
  return (
    <div css={selectWrapperStyles}>
      <div css={menuListWrapperStyles}>
        <MenuList
          root
          dropdown
          open={opened}
          onChangeOpen={setOpened}
          trigger={
            <button css={triggerStyles} onClick={onTriggerClick}>
              <Caret color={caretColor} variant="down" />
            </button>
          }
        >
          {options.map((text, index) => (
            <MenuItem
              itemAlignment="left"
              selected={value === text}
              key={index}
              onSelect={() => onChange(text)}
            >
              <span css={itemStyles}>{text}</span>
            </MenuItem>
          ))}
        </MenuList>
      </div>
    </div>
  );
}
