/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { useAutoAnimate } from '../../../hooks';
import { cssVar } from '../../../primitives';
import {
  innerTablesNoBottomBorderStyles,
  innerTablesNoTopBorderStyles,
} from '../../../styles/table';
import { tableRowCounter } from '../../../utils';

export const regularBorder = `1px solid ${cssVar('borderSubdued')}`;
const borderRadius = '8px';

const tableBaseStyles = css({
  // NOTE: border radius on the table does not work with `borderCollapse: collapse`,
  // that's why we need `borderCollapse: separate` on the table and to style <th>
  // and <td> separately for borders and border radius.
  height: '100%',

  '@-moz-document url-prefix()': {
    height: 'auto',
  },

  position: 'relative',
  left: '-18px',

  borderCollapse: 'inherit',
  borderSpacing: '0',
  tableLayout: 'auto',
  counterReset: tableRowCounter,
  display: 'inline-table',
  'tr td': {
    borderBottom: regularBorder,
    background: cssVar('backgroundMain'),
  },
  td: {
    borderLeft: regularBorder,
  },
  'td:last-child': {
    borderRight: regularBorder,
  },

  tbody: {
    height: '100%',
  },

  table: {
    marginBottom: 0,
    'tr:last-child td': {
      borderBottom: 0,
    },
    'tr td:first-of-type': {
      borderLeft: 0,
    },
    'tr td:last-child': {
      borderRight: 0,
    },
  },
});

const nestedStyles = css({
  borderBottom: 0,
  th: {
    ...innerTablesNoTopBorderStyles,
  },
  'tr:last-child td': {
    ...innerTablesNoBottomBorderStyles,
  },
  'td:first-of-type': {
    borderLeft: 0,
  },
});

const readOnlyTableStyles = css({
  left: 0,
  height: 'auto',
  width: '100%',
  marginTop: 8,
  marginBottom: 4,

  '> thead > tr > th': {
    borderTop: regularBorder,
    borderBottom: regularBorder,
  },
  '> thead > tr > th + th': {
    borderLeft: regularBorder,
  },

  '> thead > tr > th:first-of-type, > tbody:not(thead + tbody) > tr:first-of-type > td:first-of-type':
    {
      borderLeft: regularBorder,
      borderTopLeftRadius: borderRadius,
    },
  '> thead > tr > th:last-of-type, > tbody:not(thead + tbody) > tr:first-of-type > td:last-of-type':
    {
      borderRight: regularBorder,
      borderTopRightRadius: borderRadius,
    },
  '> tbody > tr:last-of-type > td:first-of-type': {
    borderBottomLeftRadius: borderRadius,
  },
  '> tbody > tr:last-of-type > td:last-of-type': {
    borderBottomRightRadius: borderRadius,
  },
});

const wideTableStyles = css({
  width: 'initial',
  maxWidth: 'initial',
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
  '> tbody > tr:last-of-type > td:first-of-type': {
    borderBottomLeftRadius: borderRadius,
  },
  '> tbody > tr:last-of-type > td:last-of-type': {
    borderBottomRightRadius: borderRadius,
  },
});

const allBorderStyles = ({
  outerBorder,
  innerBorder,
}: {
  outerBorder: string;
  innerBorder: string;
}) =>
  css({
    '': {
      borderRight: innerBorder,
      borderBottom: innerBorder,
    },
    '> thead > tr > th, > tbody:not(thead + tbody) > tr:nth-of-type(2) > td': {
      borderTop: innerBorder,
    },
    '> thead > tr > th:nth-of-type(2), > tbody > tr > td:nth-of-type(1), > tfoot > tr > td:nth-of-type(1)':
      {
        borderLeft: outerBorder,
      },
    '> thead > tr > th:nth-last-of-type(1), > tbody > tr > td:nth-last-of-type(1), > tfoot > tr > td:nth-last-of-type(1)':
      {
        borderRight: outerBorder,
      },
  });

const hiddenSelectionStyles = css({
  '*::selection': {
    background: 'none',
  },
});

const footerStyles = css({
  '> tbody > tr:last-of-type > td:first-of-type': {
    borderBottomLeftRadius: 0,
  },
  '> tbody > tr:last-of-type > td:last-of-type': {
    borderBottomRightRadius: 0,
  },
  '> tfoot > tr:last-of-type > td:first-of-type': {
    borderBottomLeftRadius: borderRadius,
  },
  '> tfoot > tr:last-of-type > td:last-of-type': {
    borderBottomRightRadius: borderRadius,
  },
});

type Border = 'all' | 'inner';
export type TableWidth = 'SLIM' | 'WIDE';

interface TableProps {
  readonly head?: ReactNode;
  readonly body: ReactNode;
  readonly footer?: ReactNode;
  readonly addTable?: ReactNode;
  readonly smartRow?: ReactNode;
  readonly previewMode?: boolean;
  readonly border?: Border;
  readonly dropRef?: ConnectDropTarget;
  readonly tableWidth?: TableWidth;
  readonly isSelectingCell?: boolean;
  readonly setCollapsed?: (collapsed: boolean) => void;
  readonly isCollapsed?: boolean;
  readonly isReadOnly?: boolean;
  readonly isLiveResult?: boolean;
}

export const Table = ({
  head,
  body,
  footer,
  smartRow,
  addTable,
  previewMode = true,
  border: b = 'all',
  dropRef,
  tableWidth,
  isSelectingCell,
  isReadOnly = false,
}: TableProps): ReturnType<FC> => {
  const [animateBody] = useAutoAnimate<HTMLTableSectionElement>();

  return (
    <table
      data-testid="editor-table"
      ref={dropRef}
      css={[
        tableBaseStyles,
        b === 'all' &&
          !isReadOnly && [
            borderRadiusStyles,
            allBorderStyles({
              innerBorder: regularBorder,
              outerBorder: regularBorder,
            }),
          ],
        tableWidth === 'WIDE' && wideTableStyles,
        isSelectingCell && hiddenSelectionStyles,
        isReadOnly && readOnlyTableStyles,
        !head && { borderTop: regularBorder, borderRadius: 8 },
        footer && footerStyles,
        b === 'inner' && nestedStyles,
      ]}
    >
      {head && <thead css={{ position: 'relative' }}>{head}</thead>}
      <tbody contentEditable={false} ref={animateBody}>
        {body}
      </tbody>

      <tfoot>
        {previewMode && (
          <tr contentEditable={false} css={[css({ position: 'relative' })]}>
            {addTable}
            {smartRow}
          </tr>
        )}
        {footer}
      </tfoot>
    </table>
  );
};
