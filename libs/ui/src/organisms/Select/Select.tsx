/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ReactNode, useCallback, useState } from 'react';
import { MenuItem } from '../../atoms';
import { Caret } from '../../icons';
import { MenuList } from '../../molecules';
import { p12Regular } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

const selectWrapperStyles = css({
  position: 'relative',
});

const menuListWrapperStyles = css({
  marginLeft: 'auto',
});

const itemStyles = css(p12Regular, {
  textAlign: 'right',
  whiteSpace: 'nowrap',
});

const selectButtonStyles = css({
  display: 'flex',
  alignItems: 'center',
});

const triggerStyles = css({
  display: 'grid',
  alignItems: 'center',
  width: '16px',
});

interface SelectProps<T extends string> {
  variant?: 'transparent';
  caretColor?: 'weak' | 'normal';
  options: T[];
  value?: T;
  label?: ReactNode;
  onChange: (newSelected: T | undefined) => void;
  clear?: boolean;
}

export function Select<T extends string>({
  options,
  value,
  onChange,
  label,
  caretColor = 'normal',
  clear = false,
}: SelectProps<T>) {
  const [opened, setOpened] = useState(false);
  const onTriggerClick = useEventNoEffect(
    useCallback(() => {
      setOpened((o) => !o);
    }, [])
  );
  return (
    <div css={selectWrapperStyles}>
      <div css={menuListWrapperStyles}>
        <MenuList
          root
          dropdown
          open={opened}
          onChangeOpen={setOpened}
          trigger={
            <button
              css={[
                selectButtonStyles,
                label === 'Calculate' ? hideOnPrint : null,
              ]}
              onClick={onTriggerClick}
            >
              {label}
              <span css={[triggerStyles, hideOnPrint]}>
                <Caret color={caretColor} variant="down" />
              </span>
            </button>
          }
        >
          {clear && (
            <MenuItem
              itemAlignment="left"
              selected={value == null}
              key="clear"
              onSelect={() => onChange(undefined)}
            >
              <span css={itemStyles}>Reset</span>
            </MenuItem>
          )}
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
