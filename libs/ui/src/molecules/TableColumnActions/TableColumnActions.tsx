import { css } from '@emotion/react';
import { useState } from 'react';
import { TinyArrow, DataType, Number, Text } from '../../icons';

import {
  p14Regular,
  setCssVar,
  cssVar,
  grey400,
  grey100,
} from '../../primitives';
import { noop } from '../../utils';
import { DroopyMenu, FloatingMenu } from './wrappers';

const itemStyles = css(p14Regular, {
  display: 'grid',
  position: 'relative',
  height: '32px',

  rowGap: '10px',
});

const interactibleContentStyles = {
  display: 'flex',
  alignItems: 'center',
  borderRadius: 6,
  padding: '0 6px',
};

const iconStyles = css({
  marginRight: 6,
  width: 16,
  height: 16,
});

const arrowStyles = css({
  width: 8,
  height: 8,
  marginLeft: 'auto',
  marginRight: 2,
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
});

const buttonStyles = css(p14Regular, {
  ...interactibleContentStyles,
  color: grey400.rgb,
  ...setCssVar('currentTextColor', grey400.rgb),
  height: 30,
  ':hover, :focus': {
    backgroundColor: grey100.rgb,
  },
});

type MenuItem = 'change-type' | 'change-type/number' | 'change-type/text';

interface ButtonProps {
  menuItem: MenuItem;
  icon: React.FC<React.HTMLProps<HTMLElement>>;
  text: string;
  onClick: (item: MenuItem) => void;
  isOpen?: boolean;
  children?: JSX.Element;
}

export const MenuButton: React.FC<ButtonProps> = ({
  menuItem,
  icon: Icon,
  text,
  onClick,
  isOpen,
  children,
}) => {
  return (
    <li css={itemStyles}>
      <button css={buttonStyles} onClick={() => onClick(menuItem)}>
        <span role="presentation" css={iconStyles}>
          <Icon />
        </span>
        {text}
        {children && (
          <span role="presentation" css={arrowStyles}>
            <TinyArrow direction="right" />
          </span>
        )}
      </button>
      {isOpen && children}
    </li>
  );
};

type TableCellType = 'string' | 'number';

interface TableColumnMenuProps {
  onChangeColumnType?: (type: TableCellType) => void;
}

export const TableColumnActions: React.FC<TableColumnMenuProps> = ({
  onChangeColumnType = noop,
}) => {
  const [currentlyOpen, setCurrentlyOpen] = useState<MenuItem | null>(null);

  return (
    <DroopyMenu>
      <MenuButton
        icon={DataType}
        text="Change type"
        onClick={(item) => {
          setCurrentlyOpen((open) => (open === item ? null : item));
        }}
        menuItem="change-type"
        isOpen={currentlyOpen === 'change-type'}
      >
        <FloatingMenu>
          <MenuButton
            icon={Number}
            text="Number"
            onClick={() => onChangeColumnType('number')}
            menuItem="change-type/number"
          />
          <MenuButton
            icon={Text}
            text="Text"
            onClick={() => onChangeColumnType('string')}
            menuItem="change-type/text"
          />
        </FloatingMenu>
      </MenuButton>
    </DroopyMenu>
  );
};
