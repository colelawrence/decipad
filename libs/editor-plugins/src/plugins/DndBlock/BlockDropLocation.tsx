import { forwardRef, useImperativeHandle, useReducer } from 'react';
import { useMyEditorRef } from '@decipad/editor-types';
import { useDragDropManager } from 'react-dnd';
import { getDropLocationForMonitor } from './getDropLocationForMonitor';
import { BlockDropLine, BlockDropArea } from '@decipad/ui';

export interface BlockDropLocationRef {
  update: () => void;
}

export const BlockDropLocation = forwardRef<BlockDropLocationRef>(
  (_props, ref) => {
    const editor = useMyEditorRef();
    const dragDropManager = useDragDropManager();
    const monitor = dragDropManager.getMonitor();
    const [, rerender] = useReducer((x) => x + 1, 0);

    useImperativeHandle(ref, () => ({
      update: rerender,
    }));

    const dropLocation = getDropLocationForMonitor(editor, monitor);
    if (!dropLocation) return null;

    const { type } = dropLocation;

    if (type === 'dropArea') {
      const { rects } = dropLocation;

      return (
        <>
          {rects.map((rect, index) => (
            <BlockDropArea key={index} {...rect} />
          ))}
        </>
      );
    }
    const { mainAxis, crossAxis } = dropLocation;

    return (
      <BlockDropLine
        variant={
          (
            {
              horizontalDropLine: 'horizontal',
              verticalDropLine: 'vertical',
            } as const
          )[type]
        }
        mainAxis={mainAxis}
        crossAxisStart={crossAxis.start}
        crossAxisEnd={crossAxis.end}
      />
    );
  }
);
