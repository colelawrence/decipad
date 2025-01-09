import type { Computer } from '@decipad/computer-interfaces';
import { useComputer, useNodePath } from '@decipad/editor-hooks';
import type { MyElement, MyElementOrText } from '@decipad/editor-types';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_PARAGRAPH,
  alwaysWritableElementTypes,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  createStructuredCodeLine,
  generateVarName,
  getCodeLineSource,
  insertNodes,
  showColumnBorder,
} from '@decipad/editor-utils';
import { useAnnotations } from '@decipad/notebook-state';
import {
  dndPreviewActions,
  useInsideLayoutContext,
  useIsEditorReadOnly,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { parseSimpleValue } from '@decipad/remote-computer';
import {
  BlockAnnotations,
  BlockContextualActions,
  BlockContextualActionsProps,
  EditorBlock,
  DraggableBlock as UIDraggableBlock,
  useMergedRef,
} from '@decipad/ui';
import styled from '@emotion/styled';
import { getPreviousNode, select } from '@udecode/plate-common';
import { blockSelectionSelectors } from '@udecode/plate-selection';
import { Chat } from 'libs/ui/src/icons';
import { nanoid } from 'nanoid';
import type { ComponentProps, FC, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Portal } from 'react-portal';
import { useSelected } from 'slate-react';
import { BlockErrorBoundary } from '../BlockErrorBoundary';
import { BlockSelectable } from '../BlockSelection/BlockSelectable';
import { dndStore, useDnd } from '../utils/useDnd';
import { DraggableBlockOverlay } from './DraggableBlockOverlay';
import { DragHandle } from './DragHandle';

const DraggableBlockStyled = styled.div<{
  blockHighlighted: boolean;
  fullHeight?: boolean;
}>(({ fullHeight }) => ({
  height: fullHeight ? '100%' : undefined,

  '> div': {
    position: 'relative',
    borderRadius: 8,
    height: fullHeight ? '100%' : undefined,
  },
}));

type DraggableBlockProps = {
  readonly element: MyElement;
  readonly children: ReactNode;
  readonly hasPreviousSibling?: boolean; // used for code line blocks
  readonly contextualActions?: BlockContextualActionsProps['contextualActions'];
  readonly isCommentable?: boolean;
} & Pick<
  ComponentProps<typeof UIDraggableBlock>,
  'blockKind' | 'isCentered' | 'fullWidth' | 'fullHeight' | 'slateAttributes'
> &
  Partial<Pick<ComponentProps<typeof UIDraggableBlock>, 'layoutDirection'>>;

const PLACEHOLDERS = {
  input: '100$',
  formula: '14 * 3',
};

export const DraggableBlock: FC<DraggableBlockProps> = ({
  children,
  element,
  hasPreviousSibling,
  isCentered,
  isCommentable: isCommentableProp = true,
  fullWidth = false,
  fullHeight = false,
  contextualActions: contextualActionsProp = [],
  blockKind,
  slateAttributes,
  layoutDirection = 'rows',
}) => {
  const editor = useMyEditorRef();
  const readOnly = useIsEditorReadOnly();
  const computer = useComputer();
  const insideLayout = useInsideLayoutContext();

  const hasPadding = insideLayout && showColumnBorder(element.type as any);

  const setSidebar = useNotebookMetaData((s) => s.setSidebar);

  const { handleExpandedBlockId, permission } = useAnnotations();

  const blockSelectedIds = blockSelectionSelectors.selectedIds() as Set<string>;
  const isMultipleSelection = blockSelectedIds.size > 1;

  const selected = useSelected();
  const path = useNodePath(element);

  // Only show the Blue line to add element on these conditions.
  // If its a nested element (Such as a list, don't show it in between).
  const showLine =
    path &&
    path.length === 1 &&
    !(
      editor.children.length === 2 && editor.children[1].children[0].text === ''
    );

  const blockRef = useRef<HTMLDivElement>(null);
  const ref = useMergedRef(slateAttributes?.ref, blockRef);

  const { dragRef, isDragging } = useDnd({ element });

  const draggingIds = dndStore.use.draggingIds();

  const previewHtmlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      dndPreviewActions.draggingId('');
    }
  }, [isDragging]);

  const canComment = isCommentableProp && !!permission && !insideLayout;

  const handleAnnotation = useCallback(() => {
    if (element.id == null) {
      return;
    }

    setSidebar({ type: 'annotations' });
    handleExpandedBlockId(element.id);
  }, [element.id, handleExpandedBlockId, setSidebar]);

  const onAdd = useCallback(() => {
    if (path == null) return;
    const entry = getPreviousNode(editor, {
      at: path,
    });
    const [prevNode] = entry || [];
    insertNodes(editor, [insertSameNodeType(prevNode as MyElement, computer)], {
      at: path,
    });
    select(editor, path);
  }, [path, editor, computer]);

  const [blockHighlighted, setBlockHighlighted] = useState(false);

  const contextualActions = [...contextualActionsProp];
  if (canComment) {
    contextualActions.unshift({
      id: 'comment',
      icon: <Chat />,
      onClick: handleAnnotation,
    });
  }

  if (readOnly) {
    return (
      <EditorBlock
        blockKind={blockKind}
        isHidden={element.isHidden}
        fullWidth={fullWidth}
        fullHeight={fullHeight}
        slateAttributes={slateAttributes}
        contentEditable={
          !readOnly || alwaysWritableElementTypes.includes(element.type)
        }
        blockRef={ref}
      >
        <BlockContextualActions
          contextualActions={contextualActions}
          fullHeight={fullHeight}
        >
          <BlockErrorBoundary element={element}>{children}</BlockErrorBoundary>
        </BlockContextualActions>

        {'getElementById' in document &&
          document.getElementById('annotations-container') &&
          createPortal(
            <BlockAnnotations
              blockId={element.id}
              blockRef={blockRef}
              setBlockHighlighted={setBlockHighlighted}
            />,
            document.getElementById('annotations-container')!
          )}
      </EditorBlock>
    );
  }

  const isBeingDragged = isDragging || draggingIds.has(element.id);

  return (
    <>
      {isBeingDragged && (
        <Portal>
          <DraggableBlockOverlay
            element={element}
            previewHtmlRef={previewHtmlRef}
          />
        </Portal>
      )}

      <UIDraggableBlock
        blockKind={blockKind}
        elementId={element.id}
        isHidden={element.isHidden}
        isMultipleSelection={isMultipleSelection}
        isSelected={selected}
        dragSource={dragRef}
        isBeingDragged={isBeingDragged}
        onAdd={onAdd}
        showLine={showLine}
        isCentered={isCentered}
        hasPreviousSibling={hasPreviousSibling}
        insideLayout={insideLayout}
        hasPadding={hasPadding}
        fullWidth={fullWidth}
        fullHeight={fullHeight}
        DragHandle={<DragHandle element={element} fullHeight={fullHeight} />}
        slateAttributes={slateAttributes}
        layoutDirection={layoutDirection}
        blockRef={ref}
      >
        <DraggableBlockStyled
          blockHighlighted={blockHighlighted}
          data-testid="draggable-block"
          fullHeight={fullHeight}
        >
          <BlockSelectable element={element}>
            <BlockContextualActions
              contextualActions={contextualActions}
              fullHeight={fullHeight}
            >
              <BlockErrorBoundary element={element}>
                <div ref={previewHtmlRef}>{children}</div>
              </BlockErrorBoundary>
            </BlockContextualActions>
          </BlockSelectable>
        </DraggableBlockStyled>

        {document.getElementById('annotations-container') &&
          createPortal(
            <BlockAnnotations
              blockId={element.id}
              blockRef={blockRef}
              setBlockHighlighted={setBlockHighlighted}
            />,
            document.getElementById('annotations-container')!
          )}
      </UIDraggableBlock>
    </>
  );
};

const insertSameNodeType = (
  prevNode: MyElement | undefined,
  computer: Computer
): MyElementOrText => {
  const id = nanoid();
  const { input, formula } = PLACEHOLDERS;
  switch (prevNode?.type) {
    case ELEMENT_CODE_LINE_V2: {
      const prevNodeText = getCodeLineSource(prevNode.children[1]);
      const isSimpleValue = !!parseSimpleValue(prevNodeText);
      const autoVarName = computer.getAvailableIdentifier(generateVarName());
      return createStructuredCodeLine({
        id,
        varName: autoVarName,
        code: isSimpleValue ? input : formula,
      });
    }
    case ELEMENT_CODE_LINE:
      return {
        id,
        type: ELEMENT_CODE_LINE,
        children: [{ text: '' }],
      };
    default:
      return {
        id,
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      };
  }
};
