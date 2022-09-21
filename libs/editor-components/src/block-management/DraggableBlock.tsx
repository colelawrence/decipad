import {
  alwaysWritableElementTypes,
  MyElement,
  MyReactEditor,
  useTEditorRef,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { useComputer, useIsEditorReadOnly } from '@decipad/react-contexts';
import {
  findNodePath,
  getStartPoint,
  hasNode,
  insertElements,
  removeNodes,
  insertNodes,
  select,
  setSelection,
  useDndBlock,
  getNodeString,
  insertText,
  getNextNode,
  getEndPoint,
  focusEditor,
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
import copyToClipboard from 'copy-to-clipboard';
import {
  clone,
  requirePathBelowBlock,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { useSelected } from 'slate-react';
import { isFlagEnabled } from '@decipad/feature-flags';
import { EditorBlock, DraggableBlock as UIDraggableBlock } from '@decipad/ui';
import { nanoid } from 'nanoid';
import { BlockErrorBoundary } from '../BlockErrorBoundary';

const InDraggableBlock = createContext(false);

type DraggableBlockProps = {
  readonly element: MyElement;
  readonly children: ReactNode;
} & Pick<ComponentProps<typeof UIDraggableBlock>, 'blockKind' | 'onDelete'>;

type OnDelete = (() => void) | false | undefined;

const defaultOnDelete = (
  editor: MyReactEditor,
  element: MyElement,
  parentOnDelete?: OnDelete
): void => {
  const path = findNodePath(editor, element);

  const onDelete = () => {
    if (path) {
      removeNodes(editor, {
        at: path,
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
  const editor = useTEditorRef();
  const readOnly = useIsEditorReadOnly();
  const computer = useComputer();
  const isInDraggableBlock = useContext(InDraggableBlock);
  const { id } = element;

  const selected = useSelected();
  const setIsHidden = useElementMutatorCallback(editor, element, 'isHidden');

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

  const onDuplicate = useCallback(() => {
    const path = findNodePath(editor, element);
    if (path) {
      const newEl = clone(computer, element);
      insertElements(editor, newEl, {
        at: requirePathBelowBlock(editor, path),
      });
    }
  }, [computer, editor, element]);

  const onAdd = useCallback(() => {
    const path = findNodePath(editor, element);
    if (path === undefined) return;
    insertNodes(
      editor,
      {
        id: nanoid(),
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      },
      {
        at: path,
      }
    );
    select(editor, path);
  }, [editor, element]);

  const onPlus = useCallback(() => {
    const value = getNodeString(element);
    const isParagraph = element.type === ELEMENT_PARAGRAPH;
    const path = findNodePath(editor, element);

    const createNewParagraph = value || !isParagraph;

    if (!path) return;
    if (value === '/') return;

    if (createNewParagraph) {
      const nextNode = getNextNode(editor, { at: path });
      const [, nextPath] = nextNode || [];
      if (!nextPath) return;

      insertNodes(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_PARAGRAPH,
          children: [{ text: '/' }],
        },
        {
          at: nextPath,
        }
      );
      select(editor, getEndPoint(editor, nextPath));
      focusEditor(editor);
    } else {
      insertText(editor, '/', { at: path });
      select(editor, getEndPoint(editor, path));
      focusEditor(editor);
    }
  }, [editor, element]);

  const onCopyHref = useCallback(() => {
    const url = new URL(window.location.toString());
    url.hash = element.id;
    copyToClipboard(url.toString());
  }, [element.id]);

  if (deleted || (readOnly && element.isHidden)) {
    return null;
  }
  if (readOnly) {
    return (
      <div
        contentEditable={
          !readOnly || alwaysWritableElementTypes.includes(element.type)
        }
        suppressContentEditableWarning
      >
        <EditorBlock blockKind={props.blockKind}>
          <BlockErrorBoundary element={element}>{children}</BlockErrorBoundary>
        </EditorBlock>
      </div>
    );
  }
  // Nested Draggables (such as lists) do not work well enough with useDndBlock; they are very buggy.
  // If we want this, we need to build a better dnd.
  if (isInDraggableBlock) return <>{children}</>;

  return (
    <UIDraggableBlock
      {...props}
      isHidden={element.isHidden}
      isSelected={selected}
      dragSource={dragRef}
      blockRef={blockRef}
      previewRef={previewRef}
      dropLine={dropLine || undefined}
      isBeingDragged={isDragging}
      onDelete={parentOnDelete === false ? false : onDelete}
      onDuplicate={onDuplicate}
      onShowHide={(a) => {
        a === 'show' ? setIsHidden(false) : setIsHidden(true);
      }}
      onAdd={onAdd}
      onPlus={onPlus}
      onCopyHref={isFlagEnabled('COPY_HREF') ? onCopyHref : undefined}
      showLine={
        !(
          editor.children.length === 2 &&
          editor.children[1].children[0].text === ''
        )
      }
    >
      <InDraggableBlock.Provider value={true}>
        <BlockErrorBoundary element={element}>{children}</BlockErrorBoundary>
      </InDraggableBlock.Provider>
    </UIDraggableBlock>
  );
};
