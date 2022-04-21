import { Element } from '@decipad/editor-types';
import { organisms } from '@decipad/ui';
import { useDndBlock } from '@udecode/plate';
import {
  ComponentProps,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
} from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useReadOnly, useSlateStatic } from 'slate-react';
import { findPath } from '@decipad/editor-utils';

const InDraggableBlock = createContext(false);

type DraggableBlockProps = {
  readonly element: Element;
  readonly children: ReactNode;
} & Pick<
  ComponentProps<typeof organisms.DraggableBlock>,
  'blockKind' | 'onDelete'
>;
export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  children,
  element,
  onDelete: parentOnDelete,
  ...props
}) => {
  const editor = useSlateStatic() as ReactEditor;
  const readOnly = useReadOnly();
  const isInDraggableBlock = useContext(InDraggableBlock);
  const { id } = element;

  const blockRef = useRef<HTMLDivElement>(null);
  const { dragRef, dropLine, isDragging } = useDndBlock({
    id,
    blockRef,
  });

  const onDelete = useCallback(() => {
    const path = findPath(editor, element);
    if (path) {
      parentOnDelete
        ? parentOnDelete()
        : Transforms.delete(editor, {
            at: path,
          });
    }
  }, [parentOnDelete, editor, element]);

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
      onDelete={parentOnDelete === false ? false : onDelete}
    >
      <InDraggableBlock.Provider value={true}>
        {children}
      </InDraggableBlock.Provider>
    </organisms.DraggableBlock>
  );
};
