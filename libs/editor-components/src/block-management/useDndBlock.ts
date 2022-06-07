/**
 * This is a copypaste from
 * @see https://github.com/udecode/plate/blob/27228226801327665f27647585d20bc99adf1111/packages/ui/dnd/src/hooks/useDndBlock.ts
 */
import { RefObject, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useEditorRef } from '@udecode/plate-core';
import { useDragBlock, useDropBlockOnEditor } from '@udecode/plate';

export const useDndBlock = ({
  id,
  blockRef,
  previewRef,
  removePreview,
}: {
  id: string;
  blockRef: RefObject<Element>;
  previewRef?: RefObject<Element>;
  removePreview?: boolean;
}) => {
  const editor = useEditorRef();

  const [dropLine, setDropLine] = useState<'' | 'top' | 'bottom'>('');

  const [{ isDragging }, dragRef, preview] = useDragBlock(editor, id);
  const [{ isOver }, drop] = useDropBlockOnEditor(editor, {
    id,
    blockRef,
    dropLine,
    setDropLine,
  });

  if (removePreview) {
    drop(blockRef);
    preview(getEmptyImage(), { captureDraggingState: true });
  } else if (previewRef) {
    // TODO: previewElement option
    drop(blockRef);
    preview(previewRef);
  } else {
    preview(drop(blockRef));
  }

  if (!isOver && dropLine) {
    setDropLine('');
  }

  return {
    isDragging,
    dropLine,
    dragRef,
  };
};
