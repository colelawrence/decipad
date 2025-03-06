import type { Computer } from '@decipad/computer-interfaces';
import type { MyPlatePlugin } from '@decipad/editor-types';
import { onDropSmartRef } from '@decipad/editor-utils';

/**
 * Plugin that enables dropping smart refs in the document.
 *
 * It works through reading a blockId from DragEvent.dataTransfer (content-type text/x-smart-ref)
 *
 * See `onDragStartSmartRef` for the drag part
 */
export const createDndSmartRefPlugin = (computer: Computer): MyPlatePlugin => ({
  key: 'dragSmartRef',
  handlers: {
    onDrop: onDropSmartRef(computer),
  },
});
