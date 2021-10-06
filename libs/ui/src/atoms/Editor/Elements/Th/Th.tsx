import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { ComponentProps, useCallback, useState } from 'react';
import { noop } from '@decipad/utils';
import * as Icons from '../../../../icons';
import { TableColumnActions } from '../../../../molecules';

const openerWidth = 40;

const columnStyles = css({
  position: 'relative',
  fontWeight: 'normal',
  padding: '12px',
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
  attributes,
  nodeProps,
  children,
  onChangeColumnType = noop,
}: ComponentProps<PlatePluginComponent> &
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
    <th css={columnStyles} {...attributes} {...nodeProps}>
      {children}

      <button
        css={openerStyles}
        contentEditable={false}
        onClick={toggleMenuOpen}
      >
        <span css={arrowWrapperStyles}>
          <Icons.TinyArrow direction="down" />
        </span>
      </button>

      {isMenuOpen && (
        <div css={dropdownStyles} contentEditable={false}>
          <TableColumnActions onChangeColumnType={handleChangeColumnType} />
        </div>
      )}
    </th>
  );
};
