import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { isElement } from 'react-is';
import { TableData } from '../../atoms';
import { Minus } from '../../icons';
import { table } from '../../styles';
import { noop } from '../../utils';
import { EditableTableData } from '../index';

const tdStyles = css({
  // Each row is as tall as the tallest cell, so our rows are at least this high.
  minHeight: table.tdMinHeight,
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
  readonly readOnly?: boolean;
}

export const TableRow = ({
  children,
  onRemove = noop,
  readOnly = false,
}: TableRowProps): ReturnType<FC> => {
  return (
    <tr
      css={{
        display: 'grid',
        gridTemplate: table.rowTemplate(
          Children.toArray(children).length,
          readOnly
        ),
      }}
    >
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
      {!readOnly && (
        <TableData css={tdStyles}>
          <button css={buttonStyles} onClick={onRemove}>
            <span css={iconWrapperStyles}>
              <Minus />
            </span>
          </button>
        </TableData>
      )}
    </tr>
  );
};
