import { MyPlatePlugin } from '@decipad/editor-types';
import { DRAG_SMART_REF } from '@decipad/editor-utils';
import { Computer } from '@decipad/computer';
import { onDropSmartRef } from './onDrop/onDropSmartRef';

/**
 * Plugin that enables dropping smart refs in the document.
 *
 * It works through reading a blockId from DragEvent.dataTransfer (content-type text/x-smart-ref)
 *
 * See `onDragStartSmartRef` for the drag part
 */
export const createDndSmartRefPlugin = (computer: Computer): MyPlatePlugin => ({
  key: DRAG_SMART_REF,
  handlers: {
    onDrop: onDropSmartRef(computer),
  },
});
