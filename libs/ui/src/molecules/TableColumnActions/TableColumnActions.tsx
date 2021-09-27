import { css } from '@emotion/react';
import { useCallback, useState } from 'react';
import * as Icons from '../../icons';

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
            <Icons.TinyArrow />
          </span>
        )}
      </button>
      {isOpen && children}
    </li>
  );
};

interface TableColumnMenuProps {
  onSelect?: (item: MenuItem) => void;
}

export const TableColumnActions: React.FC<TableColumnMenuProps> = ({
  onSelect = noop,
}) => {
  const [currentlyOpen, setCurrentlyOpen] = useState<MenuItem | null>();

  const handleSubmenuClick = useCallback((item: MenuItem) => {
    setCurrentlyOpen((isOpen) => (isOpen ? null : item));
  }, []);

  return (
    <DroopyMenu>
      <MenuButton
        icon={Icons.DataType}
        text="Change type"
        onClick={handleSubmenuClick}
        menuItem="change-type"
        isOpen={currentlyOpen === 'change-type'}
      >
        <FloatingMenu>
          <MenuButton
            icon={Icons.Number}
            text="Number"
            onClick={onSelect}
            menuItem="change-type/number"
          />
          <MenuButton
            icon={Icons.Text}
            text="Text"
            onClick={onSelect}
            menuItem="change-type/text"
          />
        </FloatingMenu>
      </MenuButton>
    </DroopyMenu>
  );
};
