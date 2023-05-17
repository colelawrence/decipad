import {
  useDndPreviewSelectors,
  useEditorStylesContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { Table } from '..';
import { Add } from '../../icons';
import { AddTableRowButton } from '../../molecules';
import { cssVar, smallScreenQuery } from '../../primitives';
import { editorLayout } from '../../styles';
import { tableControlWidth } from '../../styles/table';
import {
  AvailableSwatchColor,
  TableStyleContext,
  UserIconKey,
} from '../../utils';
import { useEventNoEffect } from '../../utils/useEventNoEffect';
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

const scrollRightOffset = `(((100vw - 610px) / 2) + ${tableControlWidth})`;

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

const tableWrapperTransformStyles = css({
  position: 'relative',
  transform: `translateX(calc((((100vw - 580px) / 2) + ${tableControlWidth}) * -1 ))`,
  left: tableControlWidth,
});

const tableWrapperDraggingStyles = css({
  left: `-${tableControlWidth}`,
});

const tableWrapperDefaultStyles = css({
  width: '100vw',
  minWidth: editorLayout.slimBlockWidth,
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  position: 'relative',
  whiteSpace: 'nowrap',
  display: 'flex',
  '&:hover': {
    scrollbarWidth: 'inherit',
    msOverflowStyle: 'inherit',
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: cssVar('highlightColor'),
    },
  },
  '&::-webkit-scrollbar': {
    width: '100px',
    height: '8px',
  },

  '&::-webkit-scrollbar-thumb': {
    width: '3px',
    height: '3px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
    height: '3px',
  },

  '&::-webkit-scrollbar-button': {
    width: `calc((100vw - 580px)/4)`,
  },

  '&::-ms-scrollbar-thumb': {
    width: '3px',
    height: '3px',
    backgroundColor: cssVar('highlightColor'),
    borderRadius: '8px',
  },

  '&::-ms-scrollbar-track': {
    backgroundColor: 'transparent',
    height: '3px',
  },

  '&::-ms-scrollbar-button': {
    width: `calc((100vw - 580px)/4)`,
  },

  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    transform: `translateX(-40px)`,
    minWidth: '0',
  },
});

export const tableWrapperStyles = css([
  tableWrapperTransformStyles,
  tableWrapperDefaultStyles,
]);

export const tableScroll = css({
  paddingRight: `calc(${scrollRightOffset})`,
  [smallScreenQuery]: {
    paddingRight: '0px',
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
  marginLeft: `calc(${scrollRightOffset} *-1)`,
  [smallScreenQuery]: {
    marginLeft: '0px',
  },
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
  readonly id?: string;
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly isCollapsed?: boolean;
  readonly hideFormulas?: boolean;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;

  readonly children?: ReactNode;
  readonly dropRef?: ConnectDropTarget;
  readonly onAddRow?: () => void;
  readonly onAddColumn?: () => void;
  readonly previewMode?: boolean;
  readonly tableWidth?: TableWidth;
  readonly isSelectingCell?: boolean;
  readonly showAllRows?: boolean;
  readonly onSetCollapsed?: (collapsed: boolean) => void;
  readonly onSetHideFormulas?: (isHidden: boolean) => void;

  readonly smartRow?: ReactNode;
}

export const EditorTable: FC<EditorTableProps> = ({
  id,
  onAddRow,
  onAddColumn,
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
  smartRow,
  previewMode,
}: EditorTableProps): ReturnType<FC> => {
  const [caption, thead, ...tbody] = Children.toArray(children);

  useDndPreviewSelectors().previewText();

  const { color: defaultColor } = useEditorStylesContext();
  const readOnly = useIsEditorReadOnly();

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

  const onAddColumnClick = useEventNoEffect(onAddColumn);

  const draggingId = useDndPreviewSelectors().draggingId();

  const isDragging = draggingId === id;

  return (
    <TableStyleContext.Provider value={tableStyleContextValue}>
      <div css={wrapperStyles}>
        <div>
          {!previewMode && <div css={tableCaptionWrapperStyles}>{caption}</div>}

          {!isCollapsed ? (
            <div
              css={[
                !isDragging
                  ? tableWrapperTransformStyles
                  : tableWrapperDraggingStyles,
                tableWrapperDefaultStyles,
              ]}
            >
              {!isDragging && (
                <div css={tableOverflowStyles} contentEditable={false} />
              )}
              <div css={tableScroll}>
                <Table
                  isReadOnly={false}
                  dropRef={dropRef}
                  tableWidth={tableWidth}
                  isSelectingCell={isSelectingCell}
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
              </div>

              <div
                css={tableAddColumnButtonWrapperStyles}
                contentEditable={false}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <button
                  onClick={onAddColumnClick}
                  css={[
                    tableAddColumnButtonStyles,
                    mouseOver && mouseOverAddColumnButtonStyles,
                    // this is deliberately coded like this
                    // to prevent a unfixable rogue cursor from slate
                    // that otherwise would render
                    (previewMode || readOnly) && { visibility: 'hidden' },
                  ]}
                  title="Add Column"
                >
                  <Add />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </TableStyleContext.Provider>
  );
};
