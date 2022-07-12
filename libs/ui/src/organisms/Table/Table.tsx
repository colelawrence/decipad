import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { ConnectDropTarget } from 'react-dnd';
import { cssVar } from '../../primitives';
import { tableRowCounter } from '../../utils';

const border = `1px solid ${cssVar('strongHighlightColor')}`;
const borderRadius = '6px';

const tableBaseStyles = css({
  // NOTE: border radius on the table does not work with `borderCollapse: collapse`,
  // that's why we need `borderCollapse: separate` on the table and to style <th>
  // and <td> separately for borders and border radius.
  borderCollapse: 'inherit',
  borderSpacing: '0',
  tableLayout: 'auto',
  counterReset: tableRowCounter,
  minWidth: 'max-content',
});

const wideTableStyles = css({
  width: 'initial',
  maxWidth: 'initial',
  minWidth: 'max-content',
});

// Top border and border-radius, applied to table headers if they exist or to the first table row.
// Bottom border-radius, applied to the last table row, whether it's inside the tfoot or tbody.
const borderRadiusStyles = css({
  '> thead > tr > th:nth-of-type(2), > tbody:not(thead + tbody) > tr:nth-of-type(2) > td:nth-of-type(2)':
    {
      borderTopLeftRadius: borderRadius,
    },
  '> thead > tr > th:last-of-type, > tbody:not(thead + tbody) > tr:nth-of-type(2) > td:last-of-type':
    {
      borderTopRightRadius: borderRadius,
    },
  '> tfoot > tr:last-of-type > td:first-of-type': {
    borderBottomLeftRadius: borderRadius,
  },
  '> tfoot > tr:last-of-type > td:last-of-type': {
    borderBottomRightRadius: borderRadius,
  },
});

// Tables inside another table cell should only render their inner borders.
const innerBorderStyles = css({
  '> thead > tr > th, > tbody > tr:not(:last-child) > td, > tfoot > tr > td': {
    borderBottom: border,
  },
  '> thead > tr > th:not(:last-child), > tbody > tr > td:not(:last-child), > tfoot > tr > td:not(:last-child)':
    {
      borderRight: border,
    },
  table: {
    borderLeft: border,
  },
});

const allBorderStyles = css(innerBorderStyles, {
  '> thead > tr > th, > tbody > tr > td, > tfoot > tr > td': {
    borderRight: border,
    borderBottom: border,
  },
  '> thead > tr > th, > tbody:not(thead + tbody) > tr:nth-of-type(2) > td': {
    borderTop: border,
  },
  '> thead > tr > th:nth-of-type(2), > tbody > tr > td:nth-of-type(1), > tfoot > tr > td:nth-of-type(1)':
    {
      borderLeft: border,
    },
});

const hiddenSelectionStyles = css({
  '*::selection': {
    background: 'none',
  },
});

type Border = 'all' | 'inner';
export type TableWidth = 'SLIM' | 'WIDE';

interface TableProps {
  readonly border?: Border;
  readonly children?: ReactNode;
  readonly dropRef?: ConnectDropTarget;
  readonly tableWidth?: TableWidth;
  readonly isSelectingCell?: boolean;
  readonly translateX?: boolean;
}

export const Table = ({
  border: b = 'all',
  children,
  dropRef,
  tableWidth,
  isSelectingCell,
}: TableProps): ReturnType<FC> => (
  <table
    ref={dropRef}
    css={[
      tableBaseStyles,
      b === 'all' && [borderRadiusStyles, allBorderStyles],
      b === 'inner' && innerBorderStyles,
      tableWidth === 'WIDE' && wideTableStyles,
      isSelectingCell && hiddenSelectionStyles,
    ]}
  >
    {children}
  </table>
);
