import { forwardRef, useImperativeHandle, useReducer } from 'react';
import { useMyEditorRef } from '@decipad/editor-types';
import { useDragDropManager } from 'react-dnd';
import { getDropLineForMonitor } from './getDropLineForMonitor';
import { BlockDropLine as UIBlockDropLine } from '@decipad/ui';

export interface BlockDropLineRef {
  update: () => void;
}

export const BlockDropLine = forwardRef<BlockDropLineRef>((_props, ref) => {
  const editor = useMyEditorRef();
  const dragDropManager = useDragDropManager();
  const monitor = dragDropManager.getMonitor();
  const [, rerender] = useReducer((x) => x + 1, 0);

  useImperativeHandle(ref, () => ({
    update: rerender,
  }));

  const dropLine = getDropLineForMonitor(editor, monitor);
  if (!dropLine) return null;

  const { type, mainAxis, crossAxis } = dropLine;

  return (
    <UIBlockDropLine
      variant={type}
      mainAxis={mainAxis}
      crossAxisStart={crossAxis.start}
      crossAxisEnd={crossAxis.end}
    />
  );
});
