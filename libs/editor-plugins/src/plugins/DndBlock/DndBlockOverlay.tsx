import { useEffect, useReducer, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { useMyEditorRef, elementKinds, MyEditor } from '@decipad/editor-types';
import type { DragItemNode } from '@decipad/editor-components';
import type { BlockDropLocationRef } from './BlockDropLocation';
import { BlockDropLocation } from './BlockDropLocation';
import { onDropNode } from './onDropNode';
import { getDropLocations } from './getDropLocations';
import { DropLine } from './types';
import { BlockDropLine as UIBlockDropLine } from '@decipad/ui';
import { useEditorState } from '@udecode/plate-common';

// Show all drop lines
const DEBUG_DROP_LINES = false;

export const DndBlockOverlay = () => {
  const editor = useMyEditorRef();
  const dropLocationRef = useRef<BlockDropLocationRef>(null);

  const [{ isDragging }, drop] = useDrop<
    DragItemNode,
    unknown,
    { isDragging: boolean }
  >(
    {
      accept: elementKinds,
      drop: (item, monitor) => onDropNode(editor, item, monitor),
      collect: (monitor) => ({
        isDragging: monitor.isOver({ shallow: true }),
      }),
      hover: () => dropLocationRef.current?.update(),
    },
    [editor]
  );

  drop(document.body);

  if (DEBUG_DROP_LINES) {
    return <DebugDropLines />;
  }

  if (!isDragging) return null;
  return <BlockDropLocation ref={dropLocationRef} />;
};

const DebugDropLines = () => {
  const editor = useEditorState() as unknown as MyEditor;

  const [, rerender] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    window.addEventListener('scroll', rerender);
    return () => {
      window.removeEventListener('scroll', rerender);
    };
  }, []);

  const dropLocations = getDropLocations(editor, {
    allowColumns: true,
    allowDragOntoOwnMargin: false,
    draggingIds: [],
  });

  const dropLines = dropLocations.filter(
    ({ type }) => type !== 'dropArea'
  ) as DropLine[];

  return (
    <>
      {dropLines.map((dropLine, index) => (
        <UIBlockDropLine
          key={index}
          variant={
            (
              {
                horizontalDropLine: 'horizontal',
                verticalDropLine: 'vertical',
              } as const
            )[dropLine.type]
          }
          mainAxis={dropLine.mainAxis}
          crossAxisStart={dropLine.crossAxis.start}
          crossAxisEnd={dropLine.crossAxis.end}
        />
      ))}
    </>
  );
};
