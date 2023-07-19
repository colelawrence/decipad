/* eslint decipad/css-prop-named-variable: 0 */
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
import { Create } from '../../icons';
import { AddTableRowButton } from '../../molecules';
import { cssVar, smallScreenQuery } from '../../primitives';
import { editorLayout, scrollbars } from '../../styles';
import { slimBlockWidth } from '../../styles/editor-layout';
import { tableControlWidth } from '../../styles/table';
import {
  AvailableSwatchColor,
  TableStyleContext,
  UserIconKey,
} from '../../utils';
import { useEventNoEffect } from '../../utils/useEventNoEffect';
import { TableWidth } from '../Table/Table';

const halfSlimBlockWidth = `${Math.round(editorLayout.slimBlockWidth / 2)}px`;
const totalWidth = cssVar('editorWidth');
const halfTotalWidth = '50vw';
const wideToSlimBlockWidthDifference = `${
  editorLayout.wideBlockWidth - editorLayout.slimBlockWidth
}px`;
const gutterWidth = '60px';
const leftMargin = `calc(${halfTotalWidth} - ${halfSlimBlockWidth} - ${wideToSlimBlockWidthDifference})`;
const restWidthBlock = `calc(${totalWidth} - ${leftMargin} - ${gutterWidth} - ${gutterWidth})`;

const scrollRightOffset = `(((${cssVar(
  'editorWidth'
)} - 610px) / 2) + ${tableControlWidth}px)`;

const wrapperStyles = css({
  margin: '0',
});

const tableCaptionWrapperStyles = css({
  width: '100%',
  minWidth: editorLayout.slimBlockWidth,
  maxWidth: restWidthBlock,
  display: 'inline-block',
  [smallScreenQuery]: {
    maxWidth: cssVar('editorWidth'),
    minWidth: '0',
  },
  marginBottom: '8px',
});

const tableWrapperTransformStyles = css({
  position: 'relative',
  transform: `translateX(calc((((${cssVar(
    'editorWidth'
  )} - ${slimBlockWidth}px) / 2) + ${tableControlWidth}px) * -1 ))`,
  left: tableControlWidth,
});

const tableWrapperDraggingStyles = css({
  left: `-${tableControlWidth}px`,
});

const tableWrapperDefaultStyles = css(
  {
    width: cssVar('editorWidth'),
    minWidth: editorLayout.slimBlockWidth,
    overflowY: 'hidden',
    position: 'relative',
    whiteSpace: 'nowrap',
    display: 'flex',
    [smallScreenQuery]: {
      maxWidth: cssVar('editorWidth'),
      transform: `translateX(-40px)`,
      minWidth: '0',
    },
  },
  scrollbars.deciInsideNotebookOverflowXStyles
);

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
  minWidth: `calc(((${cssVar(
    'editorWidth'
  )} - ${slimBlockWidth}px) / 2) - ${tableControlWidth}px)`,
});

const tableAddColumnButtonWrapperStyles = css({
  // this is deliberately coded like this
  // to prevent a unfixable rogue cursor from slate
  // that otherwise would render
  paddingRight: 400,
  width: '32px',
  minWidth: '32px',
  paddingLeft: '8px',
  position: 'relative',
  marginLeft: `calc(${scrollRightOffset} *-1)`,
  [smallScreenQuery]: {
    marginLeft: '0px',
  },
});

const tableAddColumnButtonStyles = css({
  width: '32px',
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

const toggleTableStyles = (isCollapsed: boolean) =>
  // visibility collapsed doesnt work in safari
  isCollapsed
    ? { height: 0, overflow: 'hidden' }
    : { height: 'initial', overflow: 'auto' };

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
      <div className={'block-table'} css={wrapperStyles}>
        <div>
          {!previewMode && <div css={tableCaptionWrapperStyles}>{caption}</div>}

          <div
            css={[
              !isDragging
                ? tableWrapperTransformStyles
                : tableWrapperDraggingStyles,
              tableWrapperDefaultStyles,
              toggleTableStyles(!!isCollapsed),
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
                <Create />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TableStyleContext.Provider>
  );
};
