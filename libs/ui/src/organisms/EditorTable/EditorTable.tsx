import { useEditorStylesContext } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { Table } from '..';
import { Add } from '../../icons';
import { AddTableRowButton } from '../../molecules';
import { cssVar, smallestDesktop } from '../../primitives';
import { editorLayout } from '../../styles';
import { tableControlWidth } from '../../styles/table';
import { Column } from '../../types';
import {
  AvailableSwatchColor,
  TableStyleContext,
  UserIconKey,
} from '../../utils';
import { useMouseEventNoEffect } from '../../utils/useMouseEventNoEffect';
import { TableWidth } from '../Table/Table';

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
  overflowY: 'hidden',
  position: 'relative',
  whiteSpace: 'nowrap',
  left: tableControlWidth,
  display: 'flex',
  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    transform: `translateX(-40px)`,
    minWidth: '0',
  },
});

export const tableOverflowStyles = css({
  display: 'inline-block',
  height: '20px',
  minWidth: `calc(((100vw - 580px) / 2) - ${tableControlWidth})`,
});

const tableAddColumnButtonWrapperStyles = css({
  width: '40px',
  minWidth: '40px',
  paddingLeft: '8px',
  position: 'relative',
});

const tableAddColumnButtonStyles = css({
  width: '40px',
  minWidth: '40px',
  backgroundColor: cssVar('highlightColor'),
  borderRadius: '8px',
  padding: '8px',
  position: 'absolute',
  top: 0,
  bottom: 0,
  visibility: 'hidden',
});

const mouseOverAddColumnButtonStyles = css({
  visibility: 'unset',
});

interface EditorTableProps {
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly isCollapsed?: boolean;
  readonly hideFormulas?: boolean;
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
  readonly onSetHideFormulas?: (isHidden: boolean) => void;

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
  hideFormulas,
  tableWidth,
  isSelectingCell,
  onChangeIcon = noop,
  onChangeColor = noop,
  onSetCollapsed = noop,
  onSetHideFormulas = noop,
  hiddenRowCount = 0,
  smartRow,
  previewMode,
}: EditorTableProps): ReturnType<FC> => {
  const [caption, thead, ...tbody] = Children.toArray(children);

  const { color: defaultColor } = useEditorStylesContext();

  const tableStyleContextValue = useMemo(
    () => ({
      icon,
      color: color ?? defaultColor,
      isCollapsed,
      hideFormulas,
      setIcon: onChangeIcon,
      setColor: onChangeColor,
      setCollapsed: onSetCollapsed,
      setHideFormulas: onSetHideFormulas,
    }),
    [
      color,
      defaultColor,
      icon,
      isCollapsed,
      hideFormulas,
      onChangeColor,
      onChangeIcon,
      onSetCollapsed,
      onSetHideFormulas,
    ]
  );

  const [mouseOver, setMouseOver] = useState(false);
  const onMouseEnter = useCallback(() => setMouseOver(true), []);
  const onMouseLeave = useCallback(() => setMouseOver(false), []);

  const onAddColumnClick = useMouseEventNoEffect(onAddColumn);

  return (
    <TableStyleContext.Provider value={tableStyleContextValue}>
      <div css={wrapperStyles}>
        <div>
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
                previewMode={previewMode}
                addTable={
                  <AddTableRowButton
                    mouseOver={mouseOver}
                    onAddRow={onAddRow}
                  />
                }
                smartRow={smartRow}
                onMouseOver={setMouseOver}
              ></Table>

              {!previewMode && (
                <div
                  css={tableAddColumnButtonWrapperStyles}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                >
                  <button
                    onClick={onAddColumnClick}
                    css={[
                      tableAddColumnButtonStyles,
                      mouseOver && mouseOverAddColumnButtonStyles,
                    ]}
                    title="Add Column"
                  >
                    <Add />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </TableStyleContext.Provider>
  );
};
