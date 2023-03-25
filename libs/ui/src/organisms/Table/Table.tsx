import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, useCallback } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { useAutoAnimate } from '../../hooks';
import { cssVar, p12Medium } from '../../primitives';
import { table } from '../../styles';
import { tableRowCounter } from '../../utils';

export const regularBorder = `1px solid ${cssVar('borderTable')}`;
const liveResultBorder = `1px solid ${cssVar('borderTable')}`;
const borderRadius = '8px';

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
  'tr td': {
    borderBottom: regularBorder,
  },
  td: {
    borderLeft: regularBorder,
  },
  'td:last-child': {
    borderRight: regularBorder,
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
  'tr:last-child td': {
    borderBottom: 0,
  },
  'td:first-of-type': {
    borderLeft: 0,
  },
});

const readOnlyTableStyles = css({
  width: '100%',
  marginBottom: '12px',
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

const allBorderStyles = (outerBorder: string, innerBorder: string) =>
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
  });

const hiddenSelectionStyles = css({
  '*::selection': {
    background: 'none',
  },
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
  readonly handleSetShowALlRowsButtonPress: () => void;
}

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

const showMoreButtonWrapperStyles = css(p12Medium, {
  display: 'flex',
  flexDirection: 'row',
  lineHeight: '2rem',
});

const ShowAllRows: FC<ShowAllRowsProps> = ({
  columnCount,
  hiddenRowCount,
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
            Hiding {hiddenRowCount} rows
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
  readonly addTable?: ReactNode;
  readonly smartRow?: ReactNode;
  readonly previewMode?: boolean;
  readonly columnCount?: number;
  readonly border?: Border;
  readonly dropRef?: ConnectDropTarget;
  readonly tableWidth?: TableWidth;
  readonly isSelectingCell?: boolean;
  readonly hiddenRowCount?: number;
  readonly handleSetShowALlRowsButtonPress?: () => void;
  readonly setCollapsed?: (collapsed: boolean) => void;
  readonly isCollapsed?: boolean;
  readonly isReadOnly?: boolean;
  readonly isLiveResult?: boolean;
  readonly onMouseOver?: (over: boolean) => void;
}

export const Table = ({
  head,
  body,
  smartRow,
  addTable,
  previewMode = true,
  border: b = 'all',
  columnCount = 1,
  dropRef,
  tableWidth,
  isSelectingCell,
  hiddenRowCount = 0,
  handleSetShowALlRowsButtonPress = noop,
  isReadOnly = false,
  isLiveResult = false,
  onMouseOver = noop,
}: TableProps): ReturnType<FC> => {
  const [animateBody] = useAutoAnimate<HTMLTableSectionElement>();
  const border = isLiveResult ? liveResultBorder : regularBorder;
  const onMouseEnter = useCallback(() => onMouseOver(true), [onMouseOver]);
  const onMouseLeave = useCallback(() => onMouseOver(false), [onMouseOver]);

  return (
    <table
      ref={dropRef}
      css={[
        tableBaseStyles,
        b === 'all' &&
          !isReadOnly && [
            borderRadiusStyles,
            allBorderStyles(border, regularBorder),
          ],
        tableWidth === 'WIDE' && wideTableStyles,
        isSelectingCell && hiddenSelectionStyles,
        isLiveResult && liveResultStyles,
        b === 'inner' && nestedStyles,
        isReadOnly && readOnlyTableStyles,
        !head && { borderTop: border },
      ]}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {head && <thead>{head}</thead>}
      <tbody ref={animateBody}>
        {body}

        {hiddenRowCount > 0 && (
          <ShowAllRows
            columnCount={columnCount}
            hiddenRowCount={hiddenRowCount}
            handleSetShowALlRowsButtonPress={handleSetShowALlRowsButtonPress}
            isReadOnly={isReadOnly}
            isLiveResult={isLiveResult}
          />
        )}
      </tbody>

      <tfoot>
        {previewMode && (
          <tr contentEditable={false} css={[css({ position: 'relative' })]}>
            {addTable}
            {smartRow}
          </tr>
        )}
      </tfoot>
    </table>
  );
};
