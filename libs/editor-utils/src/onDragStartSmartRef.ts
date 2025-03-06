import {
  CodeLineElement,
  CodeLineV2Element,
  MyEditor,
  DRAG_BLOCK_ID,
  DRAG_BLOCK_ID_CONTENT_TYPE,
  DRAG_VARIABLE_NAME_CONTENT_TYPE,
  DRAG_EXPRESSION_CONTENT_TYPE,
  DRAG_EXPRESSION,
} from '@decipad/editor-types';
import { formatResult } from '@decipad/format';
import { dndPreviewActions } from '@decipad/react-contexts';
import type { Result } from '@decipad/language-interfaces';

export type SmartRefDragCallback = (opts: {
  dragType: typeof DRAG_BLOCK_ID | typeof DRAG_EXPRESSION;
  result: Result.Result;
  blockId?: string;
  variableName?: string;
  element?: CodeLineElement | CodeLineV2Element;
  asText?: string;
  expression?: string;
}) => (e: React.DragEvent) => void;

/**
 * Use this as an onDragStart event handler, to initiate dragging a blockId from one place to another
 *
 * See `createDndSmartRefPlugin` for the drop part. This function is here to avoid import cycles.
 */
export const onDragStartSmartRef =
  (editor: MyEditor): SmartRefDragCallback =>
  ({ dragType, result, blockId, variableName, element, asText, expression }) =>
  (e: React.DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = dragType;

    switch (dragType) {
      case DRAG_BLOCK_ID:
        const id = element?.id ?? blockId!;

        if (element || asText) {
          if (editor.previewRef?.current && result.type.kind === 'number') {
            dndPreviewActions.previewText(
              formatResult('en-US', result.value, result.type)
            );

            e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
          } else if (editor.previewRef?.current && asText && asText !== '') {
            dndPreviewActions.previewText(asText);
            e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
          }
        }

        e.dataTransfer.dropEffect = 'link';

        e.dataTransfer.setData(DRAG_BLOCK_ID_CONTENT_TYPE, id);
        e.dataTransfer.setData('text/plain', asText ?? '');

        if (variableName) {
          e.dataTransfer.setData(DRAG_VARIABLE_NAME_CONTENT_TYPE, variableName);
        }

        break;

      case DRAG_EXPRESSION:
        if (expression) {
          e.dataTransfer.setData('text', '');
          e.dataTransfer.setData(DRAG_EXPRESSION_CONTENT_TYPE, expression);

          if (editor.previewRef?.current) {
            dndPreviewActions.previewText(
              formatResult('en-US', result.value, result.type)
            );

            e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
          }

          if (variableName) {
            e.dataTransfer.setData(
              DRAG_VARIABLE_NAME_CONTENT_TYPE,
              variableName
            );
          }
        }
        break;
    }
  };
