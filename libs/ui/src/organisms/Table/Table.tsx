import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { ConnectDropTarget } from 'react-dnd';
import pluralize from 'pluralize';
import { noop } from '@decipad/utils';
import { cssVar } from '../../primitives';
import { tableRowCounter } from '../../utils';
import { TextAndIconButton } from '../../atoms';
import { Eye } from '../../icons';
import { table } from '../../styles';

const regularBorder = `1px solid ${cssVar('strongHighlightColor')}`;
const liveResultBorder = `1px solid ${cssVar('liveDataBackgroundColor')}`;
const borderRadius = '6px';

const tableBaseStyles = css({
  // NOTE: border radius on the table does not work with `borderCollapse: collapse`,
  // that's why we need `borderCollapse: separate` on the table and to style <th>
  // and <td> separately for borders and border radius.
  borderCollapse: 'inherit',
  borderSpacing: '0',
  tableLayout: 'auto',
  counterReset: tableRowCounter,
  display: 'inline-table',
  backgroundColor: cssVar('backgroundColor'),
});

const readOnlyTableStyles = css({
  width: '100%',
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
    borderBottom: regularBorder,
  },
  '> thead > tr > th:not(:last-child), > tbody > tr > td:not(:last-child), > tfoot > tr > td:not(:last-child)':
    {
      borderRight: regularBorder,
    },
});

const allBorderStyles = (outerBorder: string, innerBorder: string) =>
  css(innerBorderStyles, {
    '> thead > tr > th, > tbody > tr > td, > tfoot > tr > td': {
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
  });

const hiddenSelectionStyles = css({
  '*::selection': {
    background: 'none',
  },
});

const showAllRowsTdStyles = (border: string) =>
  css({
    borderBottom: border,
  });

const showAllRowsWrapperStyle = css({
  position: 'relative',
});

const thinVeilAtTheEndStyles = css({
  position: 'absolute',
  height: `calc(${table.tdMinHeight} * 1.5)`,
  left: 0,
  right: 0,
  bottom: '57px',
  background: `linear-gradient(180deg, transparent, ${cssVar(
    'backgroundColor'
  )})`,
  border: '1px solid ref',
});

const showMoreWrapperStyles = css({
  width: '100%',
  position: 'relative',
  paddingBottom: '20px',
  marginTop: '10px',
  display: 'flex',
  justifyContent: 'center',
});

const showMoreButtonWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
});

const liveResultStyles = css({
  '> thead > tr > th': {
    borderTop: liveResultBorder,
  },
  '> thead > tr > th:last-of-type, > tbody > tr > td:last-of-type, > tfoot > tr > td:last-of-type':
    {
      borderRight: liveResultBorder,
    },
  '> tbody > tr:last-of-type > td': {
    borderBottom: liveResultBorder,
  },
});

interface ShowAllRowsProps {
  readonly columnCount: number;
  readonly hiddenRowCount: number;
  readonly isReadOnly: boolean;
  readonly isLiveResult: boolean;
  readonly setShowAllRows: (showMoreRows: boolean) => void;
}

const ShowAllRows: FC<ShowAllRowsProps> = ({
  columnCount,
  hiddenRowCount,
  setShowAllRows,
  isReadOnly,
  isLiveResult,
}) => (
  <tr>
    {!isReadOnly && <td contentEditable={false} style={{ border: 0 }}></td>}
    <td
      colSpan={isReadOnly ? columnCount : columnCount + 1}
      contentEditable={false}
      css={showAllRowsTdStyles(isLiveResult ? liveResultBorder : regularBorder)}
      style={{ borderRight: 0 }}
    >
      <div css={showAllRowsWrapperStyle}>
        <div css={thinVeilAtTheEndStyles}></div>
        <div css={showMoreWrapperStyles}>
          <div css={showMoreButtonWrapperStyles}>
            <TextAndIconButton
              text={`View ${hiddenRowCount} more ${pluralize(
                'result',
                hiddenRowCount
              )}`}
              onClick={() => setShowAllRows(true)}
            >
              <Eye />
            </TextAndIconButton>
          </div>
        </div>
      </div>
    </td>
  </tr>
);

type Border = 'all' | 'inner';
export type TableWidth = 'SLIM' | 'WIDE';

interface TableProps {
  readonly head?: ReactNode;
  readonly body: ReactNode;
  readonly foot?: ReactNode;
  readonly columnCount?: number;
  readonly border?: Border;
  readonly dropRef?: ConnectDropTarget;
  readonly tableWidth?: TableWidth;
  readonly isSelectingCell?: boolean;
  readonly hiddenRowCount?: number;
  readonly setShowAllRows?: (showMoreRows: boolean) => void;
  readonly isReadOnly?: boolean;
  readonly isLiveResult?: boolean;
}

export const Table = ({
  head,
  body,
  foot,
  border: b = 'all',
  columnCount = 1,
  dropRef,
  tableWidth,
  isSelectingCell,
  hiddenRowCount = 0,
  setShowAllRows = noop,
  isReadOnly = false,
  isLiveResult = false,
}: TableProps): ReturnType<FC> => {
  const border = isLiveResult ? liveResultBorder : regularBorder;
  return (
    <table
      ref={dropRef}
      css={[
        tableBaseStyles,
        b === 'all' && [
          borderRadiusStyles,
          allBorderStyles(border, regularBorder),
        ],
        b === 'inner' && innerBorderStyles,
        tableWidth === 'WIDE' && wideTableStyles,
        isSelectingCell && hiddenSelectionStyles,
        isReadOnly && readOnlyTableStyles,
        isLiveResult && liveResultStyles,
      ]}
    >
      {head && <thead>{head}</thead>}
      <tbody>
        {body}
        {hiddenRowCount > 0 && (
          <ShowAllRows
            columnCount={columnCount}
            hiddenRowCount={hiddenRowCount}
            setShowAllRows={setShowAllRows}
            isReadOnly={isReadOnly}
            isLiveResult={isLiveResult}
          />
        )}
      </tbody>

      <tfoot>{foot}</tfoot>
    </table>
  );
};
