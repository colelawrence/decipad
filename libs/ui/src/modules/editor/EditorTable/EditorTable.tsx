/* eslint decipad/css-prop-named-variable: 0 */
import { UserIconKey } from '@decipad/editor-types';
import {
  useDndPreviewSelectors,
  useEditorStylesContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import {
  PlateEditor,
  TElement,
  findNodePath,
  focusEditor,
  getAboveNode,
  setSelection,
  toSlateNode,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import { ELEMENT_TABLE, ELEMENT_TD } from '@udecode/plate-table';
import { Children, FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { Point } from 'slate';
import { Add } from '../../../icons';
import { cssVar } from '../../../primitives';
import { AddTableRowButton } from '../../../shared';
import { table } from '../../../styles';
import { AvailableSwatchColor, TableStyleContext } from '../../../utils';
import { useEventNoEffect } from '../../../utils/useEventNoEffect';
import { Table, TableWidth } from '../Table/Table';

const wrapperStyles = css({
  margin: '0',
});

const tableAddColumnButtonStyles = css({
  width: '32px',
  backgroundColor: cssVar('backgroundDefault'),
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

const toggleTableStyles = css({ height: 'initial', overflow: 'auto' });

export interface EditorTableProps {
  readonly id?: string;
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly isCollapsed?: boolean;
  readonly hideFormulas?: boolean;
  readonly hideCellFormulas?: boolean;
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
  readonly onSetHideCellFormulas?: (isHidden: boolean) => void;

  readonly smartRow?: ReactNode;
}

const getTableCellForEvent = (
  editor: PlateEditor,
  { target }: { target: EventTarget }
) => {
  let currentNode: Node | null = target as Node;

  // Get the first Slate element ancestor of the event target
  while (currentNode) {
    if (currentNode instanceof HTMLElement && currentNode.tagName === 'INPUT') {
      // Ignore events on modal cell editor
      return null;
    }

    if (
      currentNode instanceof HTMLElement &&
      currentNode.dataset.slateNode === 'element'
    ) {
      break;
    }

    currentNode = currentNode.parentNode;
  }

  if (!currentNode) return null;

  const slateNode = toSlateNode(editor, currentNode);
  if (slateNode?.type !== ELEMENT_TD) return null;

  const slatePath = findNodePath(editor, slateNode);
  if (!slatePath) return null;

  // Return the path of the text node inside the Slate element
  return slatePath.concat([0]);
};

const isPointInCellOfCurrentTable = (
  editor: PlateEditor,
  currentTable: TElement,
  at?: Point
) => {
  if (!at) return false;

  // Make sure the point is inside some cell
  if (!getAboveNode(editor, { at, match: { type: ELEMENT_TD } })) return false;

  // Make sure the cell is inside the current table
  const tableEntry = getAboveNode(editor, {
    at: editor.selection?.anchor,
    match: { type: ELEMENT_TABLE },
  });

  if (!tableEntry) return false;

  const [anchorTableNode] = tableEntry;
  return anchorTableNode === currentTable;
};

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
  hideCellFormulas,
  tableWidth,
  isSelectingCell,
  onChangeIcon = noop,
  onChangeColor = noop,
  onSetCollapsed = noop,
  onSetHideFormulas = noop,
  onSetHideCellFormulas = noop,
  smartRow,
  previewMode,
}: EditorTableProps): ReturnType<FC> => {
  const [caption, thead, ...tbody] = Children.toArray(children);

  useDndPreviewSelectors().previewText();

  const editor = useEditorRef();
  const element = useElement();
  const { color: defaultColor } = useEditorStylesContext();
  const readOnly = useIsEditorReadOnly();

  const tableStyleContextValue = useMemo(
    () => ({
      icon,
      color: color ?? defaultColor,
      isCollapsed,
      hideFormulas,
      hideCellFormulas,
      setIcon: onChangeIcon,
      setColor: onChangeColor,
      setCollapsed: onSetCollapsed,
      setHideFormulas: onSetHideFormulas,
      setHideCellFormulas: onSetHideCellFormulas,
    }),
    [
      color,
      defaultColor,
      icon,
      isCollapsed,
      hideFormulas,
      hideCellFormulas,
      onChangeColor,
      onChangeIcon,
      onSetCollapsed,
      onSetHideFormulas,
      onSetHideCellFormulas,
    ]
  );

  const [mouseOver, setMouseOver] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  const onMouseEnter = useCallback(() => setMouseOver(true), []);
  const onMouseLeave = useCallback(() => setMouseOver(false), []);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const cellPath = getTableCellForEvent(editor, event);
      if (!cellPath) return;

      setMouseDown(true);

      /**
       * Mouse down sets anchor (unless shift key) and focus. Also set the
       * anchor if not already in the current table.
       */
      const shouldSetAnchor =
        !event.shiftKey ||
        !isPointInCellOfCurrentTable(editor, element, editor.selection?.anchor);

      const newAnchor = shouldSetAnchor
        ? { path: cellPath, offset: 0 }
        : editor.selection?.anchor;

      /**
       * Prevent default to avoid incorrect selection behaviour; manually
       * focus the editor since this is also prevented.
       */
      event.preventDefault();
      focusEditor(editor, []);

      setSelection(editor, {
        anchor: newAnchor,
        focus: { path: cellPath, offset: 0 },
      });

      document.addEventListener('mouseup', () => {
        setMouseDown(false);
      });
    },
    [editor, element]
  );

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!mouseDown) return;

      const focusCellPath = getTableCellForEvent(editor, event);
      if (!focusCellPath) return;

      // Mouse move sets focus
      setSelection(editor, {
        focus: { path: focusCellPath, offset: 0 },
      });

      event.preventDefault();
    },
    [editor, mouseDown]
  );

  // Prevent click event on cell from setting anchor
  const onClick = useCallback(
    (event: React.MouseEvent) => {
      if (getTableCellForEvent(editor, event)) {
        event.stopPropagation();
      }
    },
    [editor]
  );

  const onAddColumnClick = useEventNoEffect(onAddColumn);

  const draggingId = useDndPreviewSelectors().draggingId();

  const isDragging = draggingId === id;

  return (
    <TableStyleContext.Provider value={tableStyleContextValue}>
      <div id={id} className={'block-table'} css={wrapperStyles}>
        <div>
          {!previewMode && (
            <div css={table.smartRowHorizontalPadding}>{caption}</div>
          )}

          {!isCollapsed && (
            <div
              css={[
                toggleTableStyles,
                !isDragging
                  ? table.tableWrapperTransformStyles
                  : table.tableWrapperDraggingStyles,
                table.tableWrapperDefaultStyles,
              ]}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onClick={onClick}
            >
              {!isDragging && (
                <div css={table.tableOverflowStyles} contentEditable={false} />
              )}
              <div css={table.tableScroll} contentEditable={!readOnly}>
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
                css={table.tableAddColumnButtonWrapperStyles}
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
          )}
        </div>
      </div>
    </TableStyleContext.Provider>
  );
};
