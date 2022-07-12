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
  marginBottom: '8px',
  paddingBottom: '6px',
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

const tableWrapperStyles = css({
  transform: `translateX(-${tableControlWidth})`,
  width: 'min-content',
  minWidth: editorLayout.slimBlockWidth,
  maxWidth: restWidthBlock,
  overflowX: 'scroll',
  display: 'inline-block',
  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    minWidth: '0',
  },
});

interface EditorTableProps {
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;

  readonly columns: Column[];
  readonly children?: ReactNode;
  readonly dropRef?: ConnectDropTarget;
  readonly onAddRow?: () => void;
  readonly tableWidth?: TableWidth;
  readonly isSelectingCell?: boolean;

  readonly smartRow?: ReactNode;
}

export const EditorTable: FC<EditorTableProps> = ({
  onAddRow,
  columns,
  children,
  dropRef,
  icon,
  color,
  tableWidth,
  isSelectingCell,
  onChangeIcon = noop,
  onChangeColor = noop,
  smartRow,
}: EditorTableProps): ReturnType<FC> => {
  const [caption, thead, ...tbody] = Children.toArray(children);

  return (
    <TableStyleContext.Provider
      value={{
        icon,
        color,
        setIcon: onChangeIcon,
        setColor: onChangeColor,
      }}
    >
      <div css={wrapperStyles}>
        <div css={wrapperInnerStyles}>
          <div css={tableCaptionWrapperStyles}>{caption}</div>
          <div css={tableWrapperStyles}>
            <Table
              dropRef={dropRef}
              tableWidth={tableWidth}
              isSelectingCell={isSelectingCell}
            >
              <thead>{thead}</thead>
              <tbody>{tbody}</tbody>
              <tfoot contentEditable={false}>
                {smartRow}
                <AddTableRowButton
                  colSpan={columns.length + 1}
                  onAddRow={onAddRow}
                />
              </tfoot>
            </Table>
          </div>
        </div>
      </div>
    </TableStyleContext.Provider>
  );
};
