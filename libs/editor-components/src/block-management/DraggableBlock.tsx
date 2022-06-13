import {
  alwaysWritableElementTypes,
  MyElement,
  MyReactEditor,
  useTEditorState,
} from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { atoms, organisms } from '@decipad/ui';
import {
  deleteText,
  findNodePath,
  getStartPoint,
  hasNode,
  setSelection,
  useDndBlock,
} from '@udecode/plate';
import {
  ComponentProps,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { BlockErrorBoundary } from '../BlockErrorBoundary';

const InDraggableBlock = createContext(false);

type DraggableBlockProps = {
  readonly element: MyElement;
  readonly children: ReactNode;
} & Pick<
  ComponentProps<typeof organisms.DraggableBlock>,
  'blockKind' | 'onDelete'
>;

type OnDelete = (() => void) | false | undefined;

const defaultOnDelete = (
  editor: MyReactEditor,
  element: MyElement,
  parentOnDelete?: OnDelete
): void => {
  const path = findNodePath(editor, element);

  const onDelete = () => {
    if (path) {
      deleteText(editor, {
        at: path,
        unit: 'block',
      });
      if (hasNode(editor, path)) {
        const point = getStartPoint(editor, path);
        setSelection(editor, {
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
  const editor = useTEditorState();
  const readOnly = useIsEditorReadOnly();
  const isInDraggableBlock = useContext(InDraggableBlock);
  const { id } = element;

  const blockRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { dragRef, dropLine, isDragging } = useDndBlock({
    id,
    nodeRef: blockRef,
    preview: {
      ref: previewRef,
    },
  });

  const onDelete = useCallback(() => {
    setDeleted(true);
    defaultOnDelete(editor, element, parentOnDelete);
  }, [parentOnDelete, editor, element]);

  if (deleted) {
    return <></>;
  }
  if (readOnly) {
    return (
      <div
        contentEditable={
          !readOnly || alwaysWritableElementTypes.includes(element.type)
        }
        suppressContentEditableWarning
      >
        <atoms.EditorBlock blockKind={props.blockKind}>
          <BlockErrorBoundary>{children}</BlockErrorBoundary>
        </atoms.EditorBlock>
      </div>
    );
  }
  // Nested Draggables (such as lists) do not work well enough with useDndBlock; they are very buggy.
  // If we want this, we need to build a better dnd.
  if (isInDraggableBlock) return <>{children}</>;

  return (
    <organisms.DraggableBlock
      {...props}
      dragSource={dragRef}
      blockRef={blockRef}
      previewRef={previewRef}
      dropLine={dropLine || undefined}
      isBeingDragged={isDragging}
      onDelete={parentOnDelete === false ? false : onDelete}
    >
      <InDraggableBlock.Provider value={true}>
        <BlockErrorBoundary>{children}</BlockErrorBoundary>
      </InDraggableBlock.Provider>
    </organisms.DraggableBlock>
  );
};
