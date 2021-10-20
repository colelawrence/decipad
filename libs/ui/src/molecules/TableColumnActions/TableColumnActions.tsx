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

interface ButtonProps {
  icon: React.FC<React.HTMLProps<HTMLElement>>;
  iconTitle?: string;
  text: string;
  onClick: () => void;
  isOpen?: boolean;
  children?: JSX.Element;
}

export const MenuButton: React.FC<ButtonProps> = ({
  icon: Icon,
  iconTitle,
  text,
  onClick,
  isOpen,
  children,
}) => {
  return (
    <li css={itemStyles}>
      <button
        css={buttonStyles}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <span role="presentation" css={iconStyles}>
          <Icon title={iconTitle} />
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

type TableCellType =
  | 'string'
  | 'number'
  | 'date/time'
  | 'date/day'
  | 'date/month'
  | 'date/year';

interface TableColumnMenuProps {
  onChangeColumnType?: (type: TableCellType) => void;
}

type Submenu = 'change-type' | 'change-type/date';

export const TableColumnActions: React.FC<TableColumnMenuProps> = ({
  onChangeColumnType = noop,
}) => {
  const [submenu, setSubmenu] = useState<Submenu | null>(null);
  const toggleSubmenu = (item: Submenu) => {
    setSubmenu(submenu === item ? null : item);
  };

  return (
    <DroopyMenu>
      <MenuButton
        icon={DataType}
        text="Change type"
        onClick={() => {
          toggleSubmenu('change-type');
        }}
        isOpen={submenu?.startsWith('change-type')}
      >
        <FloatingMenu>
          <MenuButton
            icon={Number}
            text="Number"
            onClick={() => onChangeColumnType('number')}
          />
          <MenuButton
            icon={Text}
            text="Text"
            onClick={() => onChangeColumnType('string')}
          />
          <MenuButton
            icon={DataType}
            text="Date"
            iconTitle="Date"
            onClick={() => {
              toggleSubmenu('change-type/date');
            }}
            isOpen={submenu?.startsWith('change-type/date')}
          >
            <FloatingMenu>
              <MenuButton
                icon={DataType}
                iconTitle="Year"
                text="Year"
                onClick={() => onChangeColumnType('date/year')}
              />
              <MenuButton
                icon={DataType}
                iconTitle="Month"
                text="Month"
                onClick={() => onChangeColumnType('date/month')}
              />
              <MenuButton
                icon={DataType}
                iconTitle="Day"
                text="Day"
                onClick={() => onChangeColumnType('date/day')}
              />
              <MenuButton
                icon={DataType}
                iconTitle="Time"
                text="Time"
                onClick={() => onChangeColumnType('date/time')}
              />
            </FloatingMenu>
          </MenuButton>
        </FloatingMenu>
      </MenuButton>
    </DroopyMenu>
  );
};
