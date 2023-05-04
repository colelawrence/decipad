import { ClientEventsContext } from '@decipad/client-events';
import { Computer, parseSimpleValue } from '@decipad/computer';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  MyEditor,
  MyElement,
  MyElementOrText,
  MyReactEditor,
  alwaysWritableElementTypes,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  clone,
  createStructuredCodeLine,
  getCodeLineSource,
  insertNodes,
  requirePathBelowBlock,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import {
  dndPreviewActions,
  useComputer,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import {
  EditorBlock,
  DraggableBlock as UIDraggableBlock,
  cssVar,
  useMergedRef,
} from '@decipad/ui';
import { css } from '@emotion/react';
import {
  findNodePath,
  focusEditor,
  getEndPoint,
  getNextNode,
  getNodeString,
  getPreviousNode,
  getStartPoint,
  hasNode,
  insertElements,
  insertText,
  removeNodes,
  select,
  setSelection,
} from '@udecode/plate';
import copyToClipboard from 'copy-to-clipboard';
import { noop } from 'lodash';
import { nanoid } from 'nanoid';
import {
  ComponentProps,
  ReactNode,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSelected } from 'slate-react';
import { BlockErrorBoundary } from '../BlockErrorBoundary';
import { BlockSelectable } from '../BlockSelection/BlockSelectable';
import { UseDndNodeOptions, dndStore, useDnd } from '../utils/useDnd';

type DraggableBlockProps = {
  readonly element: MyElement;
  readonly children: ReactNode;
  readonly dependencyId?: string | string[]; // block id
  readonly [key: string]: unknown; // For organisms.DraggableBlock
  readonly onceDeleted?: () => void;
  readonly hasPreviousSibling?: boolean; // used for code line blocks
} & Pick<
  ComponentProps<typeof UIDraggableBlock>,
  | 'blockKind'
  | 'disableDrag'
  | 'onDelete'
  | 'onTurnInto'
  | 'turnInto'
  | 'isCentered'
> &
  Pick<UseDndNodeOptions, 'accept' | 'getAxis' | 'onDrop'>;

type OnDelete = (() => void) | 'none' | undefined;

const placeHolders = {
  input: '100$',
  formula: '14 * 3',
};

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
      onceDeleted = noop,
      accept,
      getAxis,
      onDrop,
      hasPreviousSibling,
      isCentered,
      dependencyId,
      ...props
    },
    forwardedRef
  ) => {
    const [deleted, setDeleted] = useState(false);
    const editor = useTEditorRef();
    const readOnly = useIsEditorReadOnly();
    const computer = useComputer();

    const dependencyArray = Array.isArray(dependencyId)
      ? dependencyId
      : typeof dependencyId === 'string'
      ? [dependencyId]
      : [];

    const dependenciesForBlock = computer.blocksInUse$.use(...dependencyArray);
    const selected = useSelected();
    const path = useNodePath(element);
    const setIsHidden = usePathMutatorCallback(editor, path, 'isHidden');

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

    useEffect(() => {
      if (!isDragging) {
        dndPreviewActions.draggingId('');
      }
    }, [isDragging]);

    const draggingIds = dndStore.use.draggingIds();

    const ref = useMergedRef(blockRef, forwardedRef);

    const event = useContext(ClientEventsContext);

    const onDelete = useCallback(() => {
      event({
        type: 'action',
        action: 'block deleted',
        props: { blockType: element.type },
      });
      setDeleted(true);
      defaultOnDelete(editor, element, parentOnDelete);
      onceDeleted();
    }, [editor, element, parentOnDelete, event, onceDeleted]);

    const onDuplicate = useCallback(() => {
      if (path) {
        const newEl = clone(computer, element);
        insertElements(editor, newEl, {
          at: requirePathBelowBlock(editor, path),
        });
        event({
          type: 'action',
          action: 'block duplicated',
          props: { blockType: newEl.type },
        });
      }
    }, [computer, editor, element, event, path]);

    const onAdd = useCallback(() => {
      if (path == null) return;
      const entry = getPreviousNode(editor, {
        at: path,
      });
      const [prevNode] = entry || [];
      insertNodes(editor, insertSameNodeType(prevNode as MyElement, computer), {
        at: path,
      });
      select(editor, path);
    }, [path, editor, computer]);

    const onPlus = useCallback(() => {
      openSlashMenu(editor, element);
      event({
        type: 'action',
        action: 'click +',
        props: { blockType: element.type },
      });
    }, [editor, element, event]);

    const onCopyHref = useCallback(() => {
      const url = new URL(window.location.toString());
      url.hash = element.id;
      copyToClipboard(url.toString());
      event({
        type: 'action',
        action: 'copy block href',
        props: { blockType: element.type },
      });
    }, [element.id, element.type, event]);

    const onShowHide = useCallback(
      (a: 'show' | 'hide') => {
        if (a === 'show') {
          setIsHidden(false);
          event({
            type: 'action',
            action: 'show block',
            props: { blockType: element.type },
          });
        } else {
          setIsHidden(true);
          event({
            type: 'action',
            action: 'hide block',
            props: { blockType: element.type },
          });
        }
      },
      [element.type, event, setIsHidden]
    );

    const onMouseDown = useCallback(() => {
      if (element.type === ELEMENT_TABLE) {
        dndPreviewActions.draggingId(element.id);
      }
    }, [element.id, element.type]);

    // Only show the Blue line to add element on these conditions.
    // If its a nested element (Such as a list, don't show it in between).
    const nodePath = findNodePath(editor, element);
    const showLine =
      nodePath &&
      nodePath.length === 1 &&
      !(
        editor.children.length === 2 &&
        editor.children[1].children[0].text === ''
      );

    if (deleted) {
      return null;
    }
    if (readOnly) {
      return (
        <EditorBlock
          {...props}
          isHidden={element.isHidden}
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
        isBeingDragged={isDragging || draggingIds.has(element.id)}
        onMouseDown={onMouseDown}
        onDelete={onDelete}
        dependenciesForBlock={dependenciesForBlock}
        onDuplicate={onDuplicate}
        onShowHide={onShowHide}
        onAdd={onAdd}
        onPlus={onPlus}
        onCopyHref={isFlagEnabled('COPY_HREF') ? onCopyHref : undefined}
        showLine={showLine}
        isCentered={isCentered}
        hasPreviousSibling={hasPreviousSibling}
      >
        <div
          css={css({
            '> div': {
              borderRadius: 8,
            },
            '*::selection': {
              background: cssVar('tableSelectionBackgroundColor'),
            },
          })}
        >
          <BlockSelectable element={element}>
            <BlockErrorBoundary element={element}>
              {children}
            </BlockErrorBoundary>
          </BlockSelectable>
        </div>
      </UIDraggableBlock>
    );
  }
);

const insertSameNodeType = (
  prevNode: MyElement | undefined,
  computer: Computer
): MyElementOrText => {
  const id = nanoid();
  const { input, formula } = placeHolders;

  switch (prevNode?.type) {
    case ELEMENT_CODE_LINE_V2: {
      const prevNodeText = getCodeLineSource(prevNode.children[1]);
      const isSimpleValue = !!parseSimpleValue(prevNodeText);
      const autoVarName = computer.getAvailableIdentifier('Unnamed', 1);

      return createStructuredCodeLine({
        id,
        varName: autoVarName,
        code: isSimpleValue ? input : formula,
      });
    }
    case ELEMENT_CODE_LINE:
      return {
        id,
        type: ELEMENT_CODE_LINE,
        children: [{ text: '' }],
      };
    default:
      return {
        id,
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      };
  }
};

const openSlashMenu = (editor: MyEditor, element: MyElement) => {
  const currentLine = getNodeString(element);
  const currentPath = findNodePath(editor, element);
  const nextNode = getNextNode(editor, { at: currentPath });
  const [nextElement, nextPath] = nextNode || [];

  if (currentLine === '/') return;
  if (!currentPath) return;

  const slashAlreadyCreated =
    currentLine !== '' && nextElement && getNodeString(nextElement) === '/';

  if (slashAlreadyCreated && nextPath) {
    select(editor, getEndPoint(editor, nextPath));
    focusEditor(editor);
    return;
  }

  const isParagraph = element.type === ELEMENT_PARAGRAPH;
  const createNewParagraph = currentLine || !isParagraph;

  if (createNewParagraph && nextPath) {
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
    insertText(editor, '/', { at: currentPath });
    select(editor, getEndPoint(editor, currentPath));
    focusEditor(editor);
  }
};
