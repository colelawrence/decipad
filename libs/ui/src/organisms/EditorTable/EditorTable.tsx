import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { Table } from '..';
import { AddTableRowButton } from '../../molecules';
import { editorLayout } from '../../styles';
import {
  AvailableSwatchColor,
  TableStyleContext,
  UserIconKey,
} from '../../utils';
import { TableWidth } from '../Table/Table';
import { smallestDesktop } from '../../primitives';
import { tableControlWidth } from '../../styles/table';
import { Column } from '../../types';
import { Add } from '../../icons';

const halfSlimBlockWidth = `${Math.round(editorLayout.slimBlockWidth / 2)}px`;
const totalWidth = '100vw';
const halfTotalWidth = '50vw';
const wideToSlimBlockWidthDifference = `${
  editorLayout.wideBlockWidth - editorLayout.slimBlockWidth
}px`;
const gutterWidth = '60px';
const leftMargin = `calc(${halfTotalWidth} - ${halfSlimBlockWidth} - ${wideToSlimBlockWidthDifference})`;
const restWidthBlock = `calc(${totalWidth} - ${leftMargin} - ${gutterWidth} - ${gutterWidth})`;

const smallScreenQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const wrapperStyles = css({
  margin: '0',
});

const wrapperInnerStyles = css({
  width: 'min-content',
});

const tableCaptionWrapperStyles = css({
  width: '100%',
  minWidth: editorLayout.slimBlockWidth,
  maxWidth: restWidthBlock,
  display: 'inline-block',
  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    minWidth: '0',
  },
});

export const tableWrapperStyles = css({
  transform: `translateX(calc((((100vw - 580px) / 2) + ${tableControlWidth}) * -1 ))`,
  width: '100vw',
  minWidth: editorLayout.slimBlockWidth,
  overflowX: 'auto',
  position: 'relative',
  whiteSpace: 'nowrap',
  left: tableControlWidth,
  display: 'flex',
  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    transform: `translateX(-${tableControlWidth})`,
    minWidth: '0',
  },
});

export const tableOverflowStyles = css({
  display: 'inline-block',
  height: '20px',
  minWidth: `calc(((100vw - 580px) / 2) - ${tableControlWidth})`,
});

const tableAddColumnButtonStyles = css({
  width: '40px',
  minWidth: '40px',
  backgroundColor: '#F2F4F7',
  marginLeft: '8px',
  borderRadius: '8px',
  padding: '8px',
  '&:hover': {
    backgroundColor: '#DDE0E5',
  },
});

interface EditorTableProps {
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly isCollapsed?: boolean;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;

  readonly columns: Column[];
  readonly children?: ReactNode;
  readonly dropRef?: ConnectDropTarget;
  readonly onAddRow?: () => void;
  readonly onAddColumn?: () => void;
  readonly previewMode?: boolean;
  readonly tableWidth?: TableWidth;
  readonly isSelectingCell?: boolean;
  readonly showAllRows?: boolean;
  readonly hiddenRowCount?: number;
  readonly onSetCollapsed?: (collapsed: boolean) => void;

  readonly smartRow?: ReactNode;
}

export const EditorTable: FC<EditorTableProps> = ({
  onAddRow,
  onAddColumn,
  columns,
  children,
  dropRef,
  icon,
  color,
  isCollapsed,
  tableWidth,
  isSelectingCell,
  onChangeIcon = noop,
  onChangeColor = noop,
  onSetCollapsed = noop,
  hiddenRowCount = 0,
  smartRow,
  previewMode,
}: EditorTableProps): ReturnType<FC> => {
  const [caption, thead, ...tbody] = Children.toArray(children);

  const tableStyleContextValue = {
    icon,
    color,
    isCollapsed,
    setIcon: onChangeIcon,
    setColor: onChangeColor,
    setCollapsed: onSetCollapsed,
  };

  return (
    <TableStyleContext.Provider value={tableStyleContextValue}>
      <div css={wrapperStyles}>
        <div css={wrapperInnerStyles}>
          {!previewMode && <div css={tableCaptionWrapperStyles}>{caption}</div>}

          {!isCollapsed ? (
            <div css={tableWrapperStyles}>
              <div css={tableOverflowStyles} contentEditable={false} />
              <Table
                isReadOnly={false}
                columnCount={columns.length}
                dropRef={dropRef}
                tableWidth={tableWidth}
                isSelectingCell={isSelectingCell}
                hiddenRowCount={hiddenRowCount}
                head={thead}
                body={tbody}
                foot={
                  !previewMode && (
                    <>
                      {smartRow}
                      <AddTableRowButton
                        colSpan={columns.length + 1}
                        onAddRow={onAddRow}
                      />
                    </>
                  )
                }
              ></Table>

              {!previewMode && (
                <button
                  onClick={onAddColumn}
                  css={tableAddColumnButtonStyles}
                  title="Add Column"
                >
                  <Add />
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </TableStyleContext.Provider>
  );
};
