import {
  CodeLineElement,
  CodeLineV2Element,
  MyEditor,
} from '@decipad/editor-types';
import React, { RefObject } from 'react';
import { findNodePath, getNodeString } from '@udecode/plate';
import { getVariableRanges } from './getVariableRanges';

export const DRAG_SMART_REF = 'smart-ref';
export const DRAG_BLOCK_ID_CONTENT_TYPE = 'text/x-block-id';

export type SmartRefDragCallback = (opts: {
  blockId?: string;
  element?: CodeLineElement | CodeLineV2Element;
  asText: string;
  previewRef?: RefObject<HTMLDivElement>;
}) => (e: React.DragEvent) => void;

/**
 * Use this as an onDragStart event handler, to initiate dragging a blockId from one place to another
 *
 * See `createDndSmartRefPlugin` for the drop part. This function is here to avoid import cycles.
 */
export const onDragStartSmartRef =
  (editor: MyEditor): SmartRefDragCallback =>
  ({ blockId, element, asText, previewRef }) =>
  (e: React.DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_SMART_REF;

    if (element) {
      const variableRanges = getVariableRanges(
        getNodeString(element),
        findNodePath(editor, element)!,
        element.id
      );

      const variable = variableRanges.find((item) => item.isDeclaration);

      if (previewRef?.current && variable?.variableName) {
        const el = previewRef.current.firstChild as HTMLElement;
        el.innerHTML = `${variable.variableName}`;

        e.dataTransfer.setDragImage(previewRef.current, 0, 0);
      }
    }

    e.dataTransfer.dropEffect = 'link';

    e.dataTransfer.setData(DRAG_BLOCK_ID_CONTENT_TYPE, element?.id ?? blockId!);
    e.dataTransfer.setData('text/plain', asText);
  };
