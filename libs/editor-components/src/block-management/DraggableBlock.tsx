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
  getNodeString,
  insertText,
  getNextNode,
  getEndPoint,
  focusEditor,
} from '@udecode/plate';
import {
  ComponentProps,
  forwardRef,
  ReactNode,
  useCallback,
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
import {
  EditorBlock,
  DraggableBlock as UIDraggableBlock,
  useMergedRef,
} from '@decipad/ui';
import { nanoid } from 'nanoid';
import { BlockErrorBoundary } from '../BlockErrorBoundary';
import { useDnd, UseDndNodeOptions } from '../utils/useDnd';

type DraggableBlockProps = {
  readonly element: MyElement;
  readonly children: ReactNode;
  readonly [key: string]: unknown; // For organisms.DraggableBlock
} & Pick<
  ComponentProps<typeof UIDraggableBlock>,
  'blockKind' | 'disableDrag' | 'onDelete'
> &
  Pick<UseDndNodeOptions, 'accept' | 'getAxis' | 'onDrop'>;

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

export const DraggableBlock: React.FC<DraggableBlockProps> = forwardRef<
  HTMLDivElement,
  DraggableBlockProps
>(
  (
    {
      children,
      element,
      onDelete: parentOnDelete,
      accept,
      getAxis,
      onDrop,
      ...props
    },
    forwardedRef
  ) => {
    const [deleted, setDeleted] = useState(false);
    const editor = useTEditorRef();
    const readOnly = useIsEditorReadOnly();
    const computer = useComputer();

    const selected = useSelected();
    const setIsHidden = useElementMutatorCallback(editor, element, 'isHidden');

    const blockRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const { dragRef, dropLine, isDragging } = useDnd({
      accept,
      element,
      getAxis,
      onDrop,
      previewRef,
      nodeRef: blockRef,
    });

    const ref = useMergedRef(blockRef, forwardedRef);

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
        <EditorBlock
          {...props}
          ref={ref}
          contentEditable={
            !readOnly || alwaysWritableElementTypes.includes(element.type)
          }
          suppressContentEditableWarning
        >
          <BlockErrorBoundary element={element}>{children}</BlockErrorBoundary>
        </EditorBlock>
      );
    }

    return (
      <UIDraggableBlock
        {...props}
        isHidden={element.isHidden}
        isSelected={selected}
        dragSource={dragRef}
        blockRef={ref}
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
        <BlockErrorBoundary element={element}>{children}</BlockErrorBoundary>
      </UIDraggableBlock>
    );
  }
);
