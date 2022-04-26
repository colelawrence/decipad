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
  useState,
} from 'react';
import { Transforms, Editor as SlateEditor } from 'slate';
import { ReactEditor, useReadOnly, useSlate } from 'slate-react';
import { findPath } from '@decipad/editor-utils';

const InDraggableBlock = createContext(false);

type DraggableBlockProps = {
  readonly element: Element;
  readonly children: ReactNode;
} & Pick<
  ComponentProps<typeof organisms.DraggableBlock>,
  'blockKind' | 'onDelete'
>;

type OnDelete = (() => void) | false | undefined;

const defaultOnDelete = (
  editor: ReactEditor,
  element: Element,
  parentOnDelete?: OnDelete
): void => {
  const path = findPath(editor, element);

  const onDelete = () => {
    if (path) {
      Transforms.delete(editor, {
        at: path,
        unit: 'block',
      });
      if (SlateEditor.hasPath(editor, path)) {
        const point = SlateEditor.start(editor, path);
        Transforms.setSelection(editor, {
          anchor: point,
          focus: point,
        });
      }
    }
  };

  if (path) {
    typeof parentOnDelete === 'function' ? parentOnDelete() : onDelete();
  }
};

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  children,
  element,
  onDelete: parentOnDelete,
  ...props
}) => {
  const [deleted, setDeleted] = useState(false);
  const editor = useSlate() as ReactEditor;
  const readOnly = useReadOnly();
  const isInDraggableBlock = useContext(InDraggableBlock);
  const { id } = element;

  const blockRef = useRef<HTMLDivElement>(null);
  const { dragRef, dropLine, isDragging } = useDndBlock({
    id,
    blockRef,
  });

  const onDelete = useCallback(() => {
    setDeleted(true);
    defaultOnDelete(editor, element, parentOnDelete);
  }, [parentOnDelete, editor, element]);

  if (deleted) {
    return <></>;
  }
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
