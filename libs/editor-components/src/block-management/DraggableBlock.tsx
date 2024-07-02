import { ClientEventsContext } from '@decipad/client-events';
import type { Computer } from '@decipad/computer-interfaces';
import {
  useComputer,
  useFilteredTabs,
  useNodePath,
  useNotebookId,
} from '@decipad/editor-hooks';
import type {
  MyEditor,
  MyElement,
  MyElementOrText,
} from '@decipad/editor-types';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  alwaysWritableElementTypes,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  createStructuredCodeLine,
  generateVarName,
  getCodeLineSource,
  insertNodes,
} from '@decipad/editor-utils';
import {
  dndPreviewActions,
  useAnnotations,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { parseSimpleValue } from '@decipad/remote-computer';
import {
  BlockAnnotations,
  BlockCommentButton,
  EditorBlock,
  DraggableBlock as UIDraggableBlock,
  useMergedRef,
} from '@decipad/ui';
import { noop } from '@decipad/utils';
import styled from '@emotion/styled';
import {
  findNodePath,
  focusEditor,
  getEndPoint,
  getNextNode,
  getNodeString,
  getPreviousNode,
  insertText,
  select,
} from '@udecode/plate-common';
import { blockSelectionSelectors } from '@udecode/plate-selection';
import copyToClipboard from 'copy-to-clipboard';
import { nanoid } from 'nanoid';
import type { ComponentProps, ReactNode } from 'react';
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Portal } from 'react-portal';
import { useSelected } from 'slate-react';
import { BlockErrorBoundary } from '../BlockErrorBoundary';
import { BlockSelectable } from '../BlockSelection/BlockSelectable';
import { dndStore, useDnd } from '../utils/useDnd';
import { DraggableBlockOverlay } from './DraggableBlockOverlay';
import { useBlockActions } from './hooks';

const DraggableBlockStyled = styled.div<{ blockHighlighted: boolean }>(() => ({
  '> div': {
    position: 'relative',
    borderRadius: 8,
    // comment this out for now, because it's causing issues
    // ...(blockHighlighted
    //   ? {
    //       '&:before': {
    //         content: '""',
    //         position: 'absolute',
    //         width: 4,
    //         height: '100%',
    //         left: -16,
    //         background: componentCssVars('ButtonPrimaryDefaultBackground'),
    //       },
    //     }
    //   : {}),
  },
}));

interface AIPanel {
  text: string;
  visible: boolean;
  toggle: () => void;
}

type DraggableBlockProps = {
  readonly element: MyElement;
  readonly children: ReactNode;
  readonly dependencyId?: string | string[]; // block id
  readonly aiPanel?: AIPanel;
  readonly needsUpgrade?: boolean;
  readonly contentEditable?: boolean;
  readonly suppressContentEditableWarning?: boolean;
  readonly id?: string; // element id for variable def
  readonly onceDeleted?: () => void;
  readonly hasPreviousSibling?: boolean; // used for code line blocks
  readonly onDownloadChart?: () => void;
} & Pick<
  ComponentProps<typeof UIDraggableBlock>,
  | 'blockKind'
  | 'disableDrag'
  | 'onDelete'
  | 'onTurnInto'
  | 'turnInto'
  | 'isCentered'
  | 'isDownloadable'
  | 'onDownload'
>;

const PLACEHOLDERS = {
  input: '100$',
  formula: '14 * 3',
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
      hasPreviousSibling,
      isCentered,
      dependencyId,
      disableDrag,
      onDownloadChart,
      ...props
    },
    forwardedRef
  ) => {
    const [deleted, setDeleted] = useState(false);

    const editor = useMyEditorRef();
    const readOnly = useIsEditorReadOnly();
    const computer = useComputer();
    const tabs = useFilteredTabs();

    const notebookId = useNotebookId();

    const event = useContext(ClientEventsContext);

    const { handleExpandedBlockId, permission } = useAnnotations();

    const dependencyArray = Array.isArray(dependencyId)
      ? dependencyId
      : typeof dependencyId === 'string'
      ? [dependencyId]
      : [];

    const dependenciesForBlock = computer.blocksInUse$.use(...dependencyArray);

    const blockSelectedIds =
      blockSelectionSelectors.selectedIds() as Set<string>;
    const isMultipleSelection = blockSelectedIds.size > 1;

    const selected = useSelected();
    const path = useNodePath(element);

    // Only show the Blue line to add element on these conditions.
    // If its a nested element (Such as a list, don't show it in between).
    const showLine =
      path &&
      path.length === 1 &&
      !(
        editor.children.length === 2 &&
        editor.children[1].children[0].text === ''
      );

    const blockRef = useRef<HTMLDivElement>(null);

    const ref = useMergedRef(blockRef, forwardedRef);

    const { dragRef, isDragging } = useDnd({ element });

    const draggingIds = dndStore.use.draggingIds();

    const previewHtmlRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isDragging) {
        dndPreviewActions.draggingId('');
      }
    }, [isDragging]);

    const onMouseDown = useCallback(() => {
      if (element.type === ELEMENT_TABLE) {
        dndPreviewActions.draggingId(element.id);
      }
    }, [element.id, element.type]);

    const { onDelete, onMoveTab, onDuplicate, onShowHide } = useBlockActions({
      editor,
      element,
    });

    const handleDelete = useCallback(() => {
      event({
        segmentEvent: {
          type: 'action',
          action: 'block deleted',
          props: { blockType: element.type },
        },
      });
      setDeleted(true);
      onDelete(parentOnDelete);
      onceDeleted();
    }, [parentOnDelete, event, element, onDelete, onceDeleted]);

    const handleAnnotation = useCallback(() => {
      handleExpandedBlockId(element.id);
    }, [element.id, handleExpandedBlockId]);

    const handleDuplicate = useCallback(() => {
      event({
        segmentEvent: {
          type: 'action',
          action: 'block duplicated',
          props: { blockType: element.type },
        },
      });
      onDuplicate();
    }, [event, onDuplicate, element]);

    const handleMoveTab = useCallback(
      (tabId: string) => {
        event({
          segmentEvent: {
            type: 'action',
            action: 'block moved to other tab',
            props: { blockType: element.type },
          },
        });
        onMoveTab(tabId);
      },
      [event, element, onMoveTab]
    );

    const handleDownloadChart = useCallback(() => {
      if (!notebookId) {
        return;
      }
      event({
        segmentEvent: {
          type: 'action',
          action: 'Chart Downloaded',
          props: { notebook_id: notebookId, analytics_source: 'frontend' },
        },
      });
      typeof onDownloadChart === 'function' && onDownloadChart();
    }, [onDownloadChart, event, notebookId]);

    const handleShowHide = useCallback(
      (action: 'show' | 'hide') => {
        event({
          segmentEvent: {
            type: 'action',
            action: `${action} block`,
            props: { blockType: element.type },
          },
        });
        onShowHide(action);
      },
      [event, element, onShowHide]
    );

    const onAdd = useCallback(() => {
      if (path == null) return;
      const entry = getPreviousNode(editor, {
        at: path,
      });
      const [prevNode] = entry || [];
      insertNodes(
        editor,
        [insertSameNodeType(prevNode as MyElement, computer)],
        {
          at: path,
        }
      );
      select(editor, path);
    }, [path, editor, computer]);

    const onPlus = useCallback(() => {
      openSlashMenu(editor, element);
      event({
        segmentEvent: {
          type: 'action',
          action: 'click +',
          props: { blockType: element.type },
        },
      });
    }, [editor, element, event]);

    const onCopyHref = useCallback(() => {
      const url = new URL(window.location.toString());

      let { pathname } = url;
      const hash = element.id;

      const pathSegments = pathname.split('/');
      if (pathSegments.length > 2) {
        pathSegments.splice(-1, 1);
        pathname = pathSegments.join('/');
      }

      const newUrl = `${url.origin}${pathname}#${hash}`;
      copyToClipboard(newUrl);

      event({
        segmentEvent: {
          type: 'action',
          action: 'copy block href',
          props: { blockType: element.type },
        },
      });
    }, [element.id, element.type, event]);

    const [blockHighlighted, setBlockHighlighted] = useState(false);

    if (deleted) {
      return null;
    }
    if (readOnly) {
      return (
        <EditorBlock
          {...props}
          isHidden={element.isHidden}
          ref={ref}
          onAnnotation={handleAnnotation}
          contentEditable={
            !readOnly || alwaysWritableElementTypes.includes(element.type)
          }
          annotationsHovered={blockHighlighted}
        >
          <BlockCommentButton
            canComment={!!permission && !disableDrag}
            onComment={handleAnnotation}
          >
            <BlockErrorBoundary element={element}>
              {children}
            </BlockErrorBoundary>
          </BlockCommentButton>

          {'getElementById' in document &&
            document.getElementById('annotations-container') &&
            createPortal(
              <BlockAnnotations
                blockId={element.id}
                blockRef={blockRef}
                setBlockHighlighted={setBlockHighlighted}
              />,
              document.getElementById('annotations-container')!
            )}
        </EditorBlock>
      );
    }

    const isBeingDragged = isDragging || draggingIds.has(element.id);

    return (
      <>
        {isBeingDragged && (
          <Portal>
            <DraggableBlockOverlay
              element={element}
              previewHtmlRef={previewHtmlRef}
            />
          </Portal>
        )}

        <UIDraggableBlock
          {...props}
          isHidden={element.isHidden}
          isMultipleSelection={isMultipleSelection}
          isSelected={selected}
          dragSource={dragRef}
          blockRef={ref}
          isBeingDragged={isBeingDragged}
          onMouseDown={onMouseDown}
          onDelete={handleDelete}
          onAnnotation={handleAnnotation}
          dependenciesForBlock={dependenciesForBlock}
          onDuplicate={handleDuplicate}
          onShowHide={handleShowHide}
          onMoveToTab={handleMoveTab}
          tabs={tabs}
          onAdd={onAdd}
          onPlus={onPlus}
          onCopyHref={onCopyHref}
          showLine={showLine}
          isCentered={isCentered}
          handleDownloadChart={
            onDownloadChart ? handleDownloadChart : undefined
          }
          hasPreviousSibling={hasPreviousSibling}
          path={path}
          disableDrag={disableDrag}
        >
          <DraggableBlockStyled
            blockHighlighted={blockHighlighted}
            data-testid="draggable-block"
          >
            <BlockSelectable element={element}>
              <BlockCommentButton
                canComment={!!permission && !disableDrag}
                onComment={handleAnnotation}
              >
                <BlockErrorBoundary element={element}>
                  <div ref={previewHtmlRef}>{children}</div>
                </BlockErrorBoundary>
              </BlockCommentButton>
            </BlockSelectable>
          </DraggableBlockStyled>

          {document.getElementById('annotations-container') &&
            createPortal(
              <BlockAnnotations
                blockId={element.id}
                blockRef={blockRef}
                setBlockHighlighted={setBlockHighlighted}
              />,
              document.getElementById('annotations-container')!
            )}
        </UIDraggableBlock>
      </>
    );
  }
);

const insertSameNodeType = (
  prevNode: MyElement | undefined,
  computer: Computer
): MyElementOrText => {
  const id = nanoid();
  const { input, formula } = PLACEHOLDERS;
  switch (prevNode?.type) {
    case ELEMENT_CODE_LINE_V2: {
      const prevNodeText = getCodeLineSource(prevNode.children[1]);
      const isSimpleValue = !!parseSimpleValue(prevNodeText);
      const autoVarName = computer.getAvailableIdentifier(generateVarName());
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
  let currentPath = findNodePath(editor, element);
  if (!currentPath) return;
  const nextNode = getNextNode(editor, { at: currentPath.slice(0, 1) });
  const [nextElement, nextPath] = nextNode || [];
  if (currentLine === '/') return;

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
      [
        {
          id: nanoid(),
          type: ELEMENT_PARAGRAPH,
          children: [{ text: '/' }],
        },
      ],
      {
        at: nextPath,
      }
    );
    select(editor, getEndPoint(editor, nextPath));
    focusEditor(editor);
  } else {
    if (currentLine && currentPath.length > 0) {
      currentPath = [currentPath[0] + 1];
    }
    insertText(editor, '/', { at: currentPath });
    select(editor, getEndPoint(editor, currentPath));
    focusEditor(editor);
  }
};
