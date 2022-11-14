import { MyEditor } from '@decipad/editor-types';
import React from 'react';

export const DRAG_SMART_REF = 'smart-ref';
export const DRAG_BLOCK_ID_CONTENT_TYPE = 'text/x-block-id';

export type SmartRefDragCallback = (opts: {
  blockId: string;
  asText: string;
}) => (e: React.DragEvent) => void;

/**
 * Use this as an onDragStart event handler, to initiate dragging a blockId from one place to another
 *
 * See `createDndSmartRefPlugin` for the drop part. This function is here to avoid import cycles.
 */
export const onDragStartSmartRef =
  (editor: MyEditor): SmartRefDragCallback =>
  ({ blockId, asText }) =>
  (e: React.DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_SMART_REF;

    e.dataTransfer.dropEffect = 'link';

    e.dataTransfer.setDragImage(getDragImage(), 1, 1);

    e.dataTransfer.setData(DRAG_BLOCK_ID_CONTENT_TYPE, blockId);
    e.dataTransfer.setData('text/plain', asText);
  };

/** spacer.gif */
const transparentPixel =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const getDragImage = () => {
  const elm = document.createElement('img');
  elm.src = transparentPixel;
  return elm;
};
