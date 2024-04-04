import type {
  CodeLineElement,
  CodeLineV2Element,
  MyEditor,
} from '@decipad/editor-types';
import { formatResult } from '@decipad/format';
import { dndPreviewActions } from '@decipad/react-contexts';
import type { Result } from '@decipad/remote-computer';

export const DRAG_SMART_REF = 'smart-ref';
export const DRAG_BLOCK_ID_CONTENT_TYPE = 'text/x-block-id';

export type SmartRefDragCallback = (opts: {
  blockId?: string;
  element?: CodeLineElement | CodeLineV2Element;
  asText: string;
  result: Result.Result;
}) => (e: React.DragEvent) => void;

/**
 * Use this as an onDragStart event handler, to initiate dragging a blockId from one place to another
 *
 * See `createDndSmartRefPlugin` for the drop part. This function is here to avoid import cycles.
 */
export const onDragStartSmartRef =
  (editor: MyEditor): SmartRefDragCallback =>
  ({ blockId, element, asText, result }) =>
  (e: React.DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = DRAG_SMART_REF;

    const id = element?.id ?? blockId!;

    if (element || asText) {
      if (editor.previewRef?.current && result.type.kind === 'number') {
        dndPreviewActions.previewText(
          formatResult('en-US', result.value, result.type)
        );

        e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
      } else if (editor.previewRef?.current && asText !== '') {
        dndPreviewActions.previewText(asText);
        e.dataTransfer.setDragImage(editor.previewRef.current, 0, 0);
      }
    }

    e.dataTransfer.dropEffect = 'link';

    e.dataTransfer.setData(DRAG_BLOCK_ID_CONTENT_TYPE, id);
    e.dataTransfer.setData('text/plain', asText);
  };
