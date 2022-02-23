import { organisms } from '@decipad/ui';
import { useDndBlock, useEditorState } from '@udecode/plate';
import { ComponentProps, createContext, useContext, useRef } from 'react';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { Element } from '../../elements';

const InDraggableBlock = createContext(false);

type DraggableBlockProps = {
  readonly element: Element;
} & Pick<ComponentProps<typeof organisms.DraggableBlock>, 'blockKind'>;
export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  element,
  children,
  ...props
}) => {
  const editor = useEditorState();
  const { id } = element;

  const blockRef = useRef<HTMLDivElement>(null);
  const { dragRef, dropLine, isDragging } = useDndBlock({
    id,
    blockRef,
  });

  // Nested Draggables (such as lists) do not work well enough with useDndBlock; they are very buggy.
  // If we want this, we need to build a better dnd.
  const isInDraggableBlock = useContext(InDraggableBlock);
  if (isInDraggableBlock) return <>{children}</>;

  return (
    <organisms.DraggableBlock
      {...props}
      dragSource={dragRef}
      blockRef={blockRef}
      dropLine={dropLine || undefined}
      isBeingDragged={isDragging}
      onDelete={() =>
        Transforms.delete(editor, { at: ReactEditor.findPath(editor, element) })
      }
    >
      <InDraggableBlock.Provider value={true}>
        {children}
      </InDraggableBlock.Provider>
    </organisms.DraggableBlock>
  );
};
