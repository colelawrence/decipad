import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { useMyEditorRef, elementKinds } from '@decipad/editor-types';
import type { DragItemNode } from '@decipad/editor-components';
import type { BlockDropLineRef } from './BlockDropLine';
import { BlockDropLine } from './BlockDropLine';
import { onDropNode } from './onDropNode';

export const DndBlockOverlay = () => {
  const editor = useMyEditorRef();
  const dropLineRef = useRef<BlockDropLineRef>(null);

  const [{ isDragging }, drop] = useDrop<
    DragItemNode,
    unknown,
    { isDragging: boolean }
  >(
    {
      accept: elementKinds,
      drop: (item, monitor) => onDropNode(editor, item, monitor),
      collect: (monitor) => ({
        isDragging: monitor.isOver(),
      }),
      hover: () => dropLineRef.current?.update(),
    },
    [editor]
  );

  drop(document.body);

  if (!isDragging) return null;
  return <BlockDropLine ref={dropLineRef} />;
};
