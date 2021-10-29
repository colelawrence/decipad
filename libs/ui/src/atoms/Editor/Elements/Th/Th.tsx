import { css } from '@emotion/react';
import { ComponentProps, useCallback, useState } from 'react';
import { noop } from '@decipad/utils';
import { TableColumnActions } from '../../../../molecules';
import { TinyArrow } from '../../../../icons';

const openerWidth = 40;

const columnStyles = css({
  position: 'relative',
  fontWeight: 'normal',
  textAlign: 'left',
  backgroundColor: '#F5F7FA',
  fontSize: '14px',
  paddingRight: openerWidth,
  color: '#4D5664',
});

const dropdownStyles = css({
  position: 'absolute',
  left: 0,
  right: 0,
  top: '100%',
});

const openerStyles = css({
  display: 'inline-flex',
  position: 'absolute',
  right: 0,
  top: 0,
  height: '100%',
  width: openerWidth,
  boxSizing: 'content-box',
  userSelect: 'none',
  justifyContent: 'center',
  alignItems: 'center',
});

const arrowWrapperStyles = css({
  width: 8.5,
  display: 'block',
});

export const ThElement = ({
  children,
  onChangeColumnType = noop,
  ...props
}: ComponentProps<'th'> &
  ComponentProps<typeof TableColumnActions>): JSX.Element => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const toggleMenuOpen = useCallback(() => {
    setMenuOpen((open) => !open);
  }, []);

  const handleChangeColumnType = useCallback(
    (newType) => {
      setMenuOpen(false);
      onChangeColumnType(newType);
    },
    [onChangeColumnType]
  );

  return (
    <th css={columnStyles} {...props}>
      {children}

      <button css={openerStyles} onClick={toggleMenuOpen}>
        <span css={arrowWrapperStyles}>
          <TinyArrow direction="down" />
        </span>
      </button>

      {isMenuOpen && (
        <div css={dropdownStyles}>
          <TableColumnActions onChangeColumnType={handleChangeColumnType} />
        </div>
      )}
    </th>
  );
};
