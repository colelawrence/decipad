/* eslint decipad/css-prop-named-variable: 0 */
import { MenuItem, MenuList, TextAndIconButton } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import {
  cssVar,
  p12Medium,
  p12Regular,
  p13Medium,
  p14Medium,
} from '../../../primitives';
import { CaretDown } from 'libs/ui/src/icons';

export interface DropdownChoice {
  label: string;
  description: string;
}

type DropdownProps = {
  selection: string;
  possibleSelections: DropdownChoice[];
  disable?: boolean;
  onRemove?: () => void;
  onChange?: (newSelection: string) => void;
};

export const Dropdown: FC<DropdownProps> = ({
  selection,
  possibleSelections,
  onRemove,
  onChange,
  disable,
}) => {
  if (disable) {
    return <div css={css(p12Medium)}>{selection}</div>;
  }

  const triggerElement = (caret = true) => (
    <div
      css={css(p12Medium, !caret && { button: { cursor: 'default' } })}
      data-testId="ui-level-dropdown"
    >
      <TextAndIconButton text={selection} onClick={noop} color={'transparent'}>
        {caret && <CaretDown />}
      </TextAndIconButton>
    </div>
  );

  return (
    <MenuList
      portal
      root
      dropdown
      align="end"
      sideOffset={4}
      trigger={triggerElement(true)}
    >
      {possibleSelections.map(({ label, description }, i) => {
        return (
          <MenuItem
            key={i}
            onSelect={() => onChange?.(label)}
            selected={selection === label}
            testid={`dropdown-${i}`}
          >
            <p css={p13Medium}>{label}</p>
            <p css={dropDownItemStyles}>{description}</p>
          </MenuItem>
        );
      })}

      {onRemove && (
        <MenuItem onSelect={onRemove}>
          <p css={dangerOptionStyles}>Remove</p>
        </MenuItem>
      )}
    </MenuList>
  );
};

const dropDownItemStyles = css(p12Regular, {
  color: cssVar('textSubdued'),
  marginTop: '6px',
  maxWidth: '224px',
});

const dangerOptionStyles = css(p14Medium, {
  color: cssVar('stateDangerBackground'),
});
