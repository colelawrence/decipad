import type { MyElement } from '@decipad/editor-types';
import { alwaysWritableElementTypes } from '@decipad/editor-types';
import {
  dndPreviewActions,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { EditorBlock, useMergedRef } from '@decipad/ui';
import type { ComponentProps, FC, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Portal } from 'react-portal';
import { BlockErrorBoundary } from '../BlockErrorBoundary';
import { dndStore, useDnd } from '../utils/useDnd';
import { DraggableBlockOverlay } from './DraggableBlockOverlay';
import { DragHandle } from './DragHandle';
import { AddNewLine } from './AddNewLine';
import { ContextualActions } from './ContextualActions';
import { blockSelectionStore } from '@udecode/plate-selection';
import { PortalledBlockAnnotations } from './PortalledBlockAnnotations';
import { noop } from '@decipad/utils';

type DraggableBlockProps = {
  readonly element: MyElement;
  readonly children: ReactNode;
} & Pick<
  ComponentProps<typeof EditorBlock>,
  | 'blockKind'
  | 'fullWidth'
  | 'slateAttributes'
  | 'layoutDirection'
  | 'contentEditable'
>;

export const DraggableBlock: FC<DraggableBlockProps> = ({
  children,
  element,
  blockKind,
  fullWidth,
  slateAttributes,
  contentEditable,
  layoutDirection = 'rows',
}) => {
  const readOnly = useIsEditorReadOnly();

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

  const isBeingDragged = isDragging || draggingIds.has(element.id);
  const isSelected = Boolean(blockSelectionStore.use.isSelected(element.id));

  return (
    <BlockErrorBoundary element={element}>
      {isBeingDragged && (
        <Portal>
          <DraggableBlockOverlay
            element={element}
            previewHtmlRef={previewHtmlRef}
          />
        </Portal>
      )}

      <EditorBlock
        isReadOnly={readOnly}
        isSelected={isSelected}
        contentEditable={
          contentEditable ??
          (!readOnly || alwaysWritableElementTypes.includes(element.type))
        }
        blockKind={blockKind}
        elementId={element.id}
        isHidden={element.isHidden}
        fullWidth={fullWidth}
        slateAttributes={slateAttributes}
        layoutDirection={layoutDirection}
        blockRef={ref}
        previewHtmlRef={previewHtmlRef}
        AddNewLine={<AddNewLine element={element} />}
        DragHandle={<DragHandle element={element} dragSource={dragRef} />}
        ContextualActions={<ContextualActions element={element} />}
        data-testId="draggable-block"
      >
        {children}
        <PortalledBlockAnnotations
          blockRef={blockRef}
          blockId={element.id}
          setBlockHighlighted={noop}
        />
      </EditorBlock>
    </BlockErrorBoundary>
  );
};
