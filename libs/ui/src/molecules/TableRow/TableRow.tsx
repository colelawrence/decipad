import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { isElement } from 'react-is';
import { TableData } from '../../atoms';
import { Minus } from '../../icons';
import { noop } from '../../utils';
import { EditableTableData } from '../index';

const tdStyles = css({
  // Each row is as tall as the tallest cell, so our rows are at least this high.
  height: '36px',
  padding: 0,
});

const buttonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
});

const iconWrapperStyles = css({
  height: '20px',
  width: '20px',
});

interface TableRowProps {
  readonly children: ReactNode;
  readonly onRemove?: () => void;
}

export const TableRow = ({
  children,
  onRemove = noop,
}: TableRowProps): ReturnType<FC> => {
  return (
    <tr>
      {Children.map(children, (child) => {
        if (child == null) {
          return null;
        }
        if (
          isElement(child) &&
          (child.type === TableData || child.type === EditableTableData)
        ) {
          return child;
        }
        console.error(
          'Received child that is not a table data component',
          child
        );
        throw new Error('Expected all children to be table data components');
      })}
      <TableData css={tdStyles}>
        <button css={buttonStyles} onClick={onRemove}>
          <span css={iconWrapperStyles}>
            <Minus />
          </span>
        </button>
      </TableData>
    </tr>
  );
};
