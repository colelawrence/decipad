/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { useWindowListener } from '@decipad/react-utils';
import { useState, useRef, ReactElement } from 'react';
import { cssVar, grey500, transparency } from '../../primitives';

interface DropdownItem {
  label: string;
  icon?: ReactElement<any, any>;
  onClick?: () => void;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactElement<any, any>;
  items: DropdownItem[];
  testId?: string;
}

const DropdownMenu = ({ trigger, items, testId }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useWindowListener('mousedown', handleClickOutside);

  return (
    <div data-testid={testId} ref={ref} onClick={() => setIsOpen(!isOpen)}>
      {trigger}
      {isOpen && (
        <div css={dropdownStyles}>
          {items.map((item) => (
            <div
              css={[dropdownItemStyles, item.disabled && disabledStyles]}
              onClick={item.onClick}
            >
              <span css={iconStyle}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const shadow1 = transparency(grey500, 0.02).rgba;
const shadow2 = transparency(grey500, 0.08).rgba;

const dropdownStyles = css({
  position: 'absolute',
  top: 20,
  backgroundColor: cssVar('backgroundColor'),
  padding: 5,
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '10px',
  zIndex: 4,
  boxShadow: `0px 1px 2px ${shadow1}, 0px 2px 12px ${shadow2}`,
});

const dropdownItemStyles = css({
  display: 'flex',
  justifyContent: 'flex-start',
  gap: '5px',
  padding: '7px 10px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',

  ':hover': {
    backgroundColor: cssVar('highlightColor'),
  },
});

const disabledStyles = css({
  opacity: 0.5,
  cursor: 'not-allowed',
});

const iconStyle = css({ width: '16px', height: '16px' });

export default DropdownMenu;
