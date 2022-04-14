import { Element } from '@decipad/editor-types';
import { organisms } from '@decipad/ui';
import { useDndBlock, useEditorState } from '@udecode/plate';
import {
  ComponentProps,
  createContext,
  ReactNode,
  useContext,
  useRef,
} from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useReadOnly } from 'slate-react';

const InDraggableBlock = createContext(false);

type DraggableBlockProps = {
  readonly element: Element;
  readonly children: ReactNode;
} & Pick<ComponentProps<typeof organisms.DraggableBlock>, 'blockKind'>;
export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  children,
  element,
  ...props
}) => {
  const editor = useEditorState();
  const readOnly = useReadOnly();
  const isInDraggableBlock = useContext(InDraggableBlock);
  const { id } = element;

  const blockRef = useRef<HTMLDivElement>(null);
  const { dragRef, dropLine, isDragging } = useDndBlock({
    id,
    blockRef,
  });

  if (readOnly) return <>{children}</>;
  // Nested Draggables (such as lists) do not work well enough with useDndBlock; they are very buggy.
  // If we want this, we need to build a better dnd.
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
