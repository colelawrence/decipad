import {
  KeyboardEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  DeleteAnnotationMutation,
  Exact,
  GetNotebookAnnotationsQuery,
  useCreateAnnotationMutation,
  useDeleteAnnotationMutation,
} from '@decipad/graphql-client';
import { css } from '@emotion/react';
import { fromUnixTime, format } from 'date-fns';
import {
  cssVar,
  grey200,
  grey400,
  tabletScreenQuery,
} from 'libs/ui/src/primitives';
import { Edit, Ellipsis } from 'libs/ui/src/icons';
import { AnnotationsContext, useNotebookId } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { Avatar, Button } from 'libs/ui/src/shared';
import { useActiveElement } from '@decipad/react-utils';
import { UseMutationExecute } from 'urql';
import { motion } from 'framer-motion';
import { CollapsedView } from './CollapsedView';
import { useAutoResizeTextarea, useVerticalOffset } from 'libs/ui/src/hooks';
import { SIDEBAR_WIDTH } from 'libs/ui/src/pages/NotebookPage/styles';
import styled from '@emotion/styled';

const annotationContainerStyles = css(`
  padding: 8px;
  width: 100%;
  &:first-of-type {
    padding-top: 0
  }
`);

const annotationHeaderStyles = css(`
  margin: 8px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr;
  column-gap: 8px;
  row-gap: 3px;
  border-bottom: solid 1px ${grey200.hex};
  padding-bottom: 8px;
`);

const avatarContainerStyles = css(`
  width: 28px;
  height: 28px;
  grid-column: 1 / 2;
  grid-row: 1 / 3;
`);

const usernameStyles = css(`
  font-weight: bold;
  grid-column: 2 / 3;
  grid-row: 1 / 2;

`);

const dateStyles = css(`
  color: ${grey400.rgb};
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  font-size: 12px;
`);

const menuButtonStyles = css(`
  grid-column: 3 / 4;
  grid-row: 1 / 3;
  justify-self: end;
  align-self: center;
  position: relative;
  & > button {
    width: 18px;
    height: 18px;
  }
`);

const annotationContentStyles = css(`
  margin: 8px;
`);

const menuStyles = css(`
  position: absolute;
  top: 18px;
  right: 0;

  display: flex;
  padding: 6px;
  flex-direction: column;
  align-items: stretch;

  border-radius: 8px;
  border: 1px solid var(--Gray-200, #ECF0F6);
  background: ${cssVar('backgroundMain')};
  box-shadow: 0px 2px 12px 0px rgba(119, 126, 137, 0.08), 0px 1px 2px 0px rgba(119, 126, 137, 0.02);

  button {
    padding: 6px;
    border-radius: 6px;
    display: flex;
  }
  button:hover {
    background: ${cssVar('backgroundAccent')};
  }
`);

const renderAnnotationString = (annotationString: string) => {
  return annotationString.split('\n').map((str, index) => {
    return (
      <span key={index}>
        {str}
        <br />
      </span>
    );
  });
};

const AnnotationView = ({
  id,
  user,
  content,
  dateCreated,
  deleteAnnotation,
}: Annotation & {
  deleteAnnotation: UseMutationExecute<
    DeleteAnnotationMutation,
    Exact<{
      annotationId: string;
    }>
  >;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useActiveElement(() => setShowMenu(false));
  const handleDelete = useCallback(() => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this annotation?')) {
      return;
    }
    deleteAnnotation({ annotationId: id });
  }, [deleteAnnotation, id]);

  return (
    <div css={annotationContainerStyles}>
      <div css={annotationHeaderStyles}>
        <div css={avatarContainerStyles}>
          <Avatar
            name={user?.username || ''}
            useSecondLetter={false}
            imageHash={user?.avatar}
          />
        </div>
        <div css={usernameStyles}>{user?.username}</div>
        <div css={dateStyles}>
          {format(fromUnixTime(dateCreated / 1000), `HH:mm, MMM do, yyyy`)}
        </div>
        <div css={menuButtonStyles} ref={ref}>
          <button onClick={() => setShowMenu((s) => !s)}>
            <Ellipsis />
          </button>

          {showMenu && (
            <div css={menuStyles}>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>
      <div css={annotationContentStyles}>{renderAnnotationString(content)}</div>
    </div>
  );
};

const newAnnotationStyles = css(`
  display: grid;
  grid-template-columns: 16px 1fr;
  column-gap: 8px;
  margin: 12px;
  svg {
    width: 16px;
    height: 16px;
  }
  textarea {
    background: none;
  }
`);

const newAnnotationButtonStyles = css(`
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  align-items: center;
  grid-gap: 8px;
  margin: 8px;
`);

const NewAnnotation = ({
  blockId,
  notebookId,
  showNewAnnotation,
  setShowNewAnnotation,
}: {
  blockId: string;
  notebookId: string;
  showNewAnnotation: boolean;
  setShowNewAnnotation: (value: boolean) => void;
  scenarioId: string | null;
}) => {
  const toast = useToast();
  const [annotation, setAnnotation] = useState<string>('');
  const [, createAnnotation] = useCreateAnnotationMutation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const inputRef = useAutoResizeTextarea();

  useEffect(() => {
    if (showNewAnnotation) {
      // Forgive me for what I am about to do.
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [showNewAnnotation, inputRef]);

  const handleSubmit = useCallback(async () => {
    const res = await createAnnotation({
      content: annotation,
      blockId,
      padId: notebookId,
    });
    if (res.error) {
      toast.error('Error creating annotation');
      setStatus('error');
      return;
    }
    setStatus('idle');
    setAnnotation('');
    setShowNewAnnotation(false);
  }, [
    createAnnotation,
    annotation,
    blockId,
    notebookId,
    toast,
    setShowNewAnnotation,
  ]);

  const handleTextAreaKeydown: KeyboardEventHandler<HTMLTextAreaElement> =
    useCallback(
      (event) => {
        const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

        if (
          (isMacOS && event.key === 'Enter' && event.metaKey) ||
          (!isMacOS && event.key === 'Enter' && event.ctrlKey)
        ) {
          handleSubmit();
        }
      },
      [handleSubmit]
    );

  const showButtons = annotation.length > 0;

  return (
    <>
      <form css={newAnnotationStyles} onSubmit={handleSubmit}>
        <Edit />
        <textarea
          disabled={status === 'loading'}
          ref={inputRef}
          value={annotation}
          placeholder="Add a comment..."
          onChange={(e) => setAnnotation(e.target.value)}
          onKeyDown={handleTextAreaKeydown}
        />
      </form>
      {showButtons && (
        <div css={newAnnotationButtonStyles}>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            css={newAnnotationButtonStyles}
          >
            <Button type="primaryBrand" onClick={handleSubmit}>
              Comment
            </Button>
            <Button
              onClick={() => {
                setAnnotation('');
              }}
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      )}
    </>
  );
};

const BlockContainer = styled.div<{
  collapsed: boolean;
  overflowing: boolean;
  offset: number;
}>(({ collapsed, overflowing, offset }) => ({
  top: overflowing ? 'unset' : offset + TOP_OFFSET,
  bottom: overflowing ? 0 : 'unset',
  zIndex: collapsed ? 0 : 1,
  transform: collapsed ? '' : 'translateX(15px)',
  position: 'absolute',
  background: cssVar('backgroundMain'),
  borderRadius: '16px',
  boxShadow: '0px 0px 5px 2px rgba(0, 0, 0, 0.05)',
  width: SIDEBAR_WIDTH,
  right: '0',
  [tabletScreenQuery]: {
    transform: 'translateX(0)',
    width: 'auto',
    ...(collapsed && { borderBottomRightRadius: 0 }),
    boxShadow: '0px 0px 5px 3px rgba(0, 0, 0, 0.1)',
  },
}));

const TOP_OFFSET = 24;

export type AnnotationArray = NonNullable<
  GetNotebookAnnotationsQuery['getAnnotationsByPadId']
>;

export type Annotation = NonNullable<AnnotationArray[number]>;

export const BlockAnnotations = ({
  blockId,
  blockRef,
  showNewAnnotation,
  setShowNewAnnotation,
  setBlockHighlighted,
}: {
  blockId: string;
  blockRef: React.RefObject<HTMLElement>;
  showNewAnnotation: boolean;
  setShowNewAnnotation: (value: boolean) => void;
  setBlockHighlighted: (value: boolean) => void;
}) => {
  const ctx = useContext(AnnotationsContext);
  const notbeookId = useNotebookId();
  const toast = useToast();
  if (!ctx) {
    toast.error('Something went wrong loading annotations');
    throw new Error('AnnotationsContext is not defined');
  }

  const [, deleteAnnotation] = useDeleteAnnotationMutation();
  const { annotations, articleRef, expandedBlockId, setExpandedBlockId } = ctx;
  const offset = useVerticalOffset(articleRef, blockRef);

  const [containerRect, setContainerRect] = useState<DOMRectReadOnly | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef?.current) {
      return;
    }
    setContainerRect(containerRef.current.getBoundingClientRect());
    const resizeObserver = new ResizeObserver((entries) => {
      const contentRect = entries[0].target.getBoundingClientRect();
      setContainerRect(contentRect);
    });
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  const collapsed = expandedBlockId !== blockId;
  const setCollapsed = (isCollapsed: boolean) => {
    setExpandedBlockId(isCollapsed ? null : blockId);
  };

  if (annotations === undefined) {
    return null;
  }

  const blockAnnotations = annotations.filter(
    (annotation): annotation is Annotation => annotation?.block_id === blockId
  );

  if (blockAnnotations.length === 0 && showNewAnnotation) {
    return (
      <BlockContainer
        collapsed={false}
        offset={offset}
        overflowing={false}
        style={{
          top: offset + TOP_OFFSET,
        }}
      >
        <NewAnnotation
          blockId={blockId}
          notebookId={notbeookId}
          showNewAnnotation={showNewAnnotation}
          scenarioId={ctx.scenarioId}
          setShowNewAnnotation={setShowNewAnnotation}
        />
      </BlockContainer>
    );
  }

  if (blockAnnotations.length === 0) {
    return null;
  }

  blockAnnotations.sort((a, b) => {
    return (
      new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
    );
  });
  // return null if no block has annotations for current scenario
  if (
    blockAnnotations.every(
      (annotation) => annotation.scenario_id !== ctx.scenarioId
    ) &&
    !showNewAnnotation
  ) {
    return null;
  }

  const overflowing = containerRect
    ? containerRect.bottom > document.documentElement.clientHeight
    : false;

  return (
    <BlockContainer
      collapsed={collapsed}
      offset={offset}
      overflowing={overflowing}
      ref={containerRef}
      onMouseOver={() => setBlockHighlighted(true)}
      onMouseOut={() => setBlockHighlighted(false)}
    >
      <CollapsedView
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        annotations={blockAnnotations}
      />
      {collapsed ? null : (
        <>
          {blockAnnotations.map((annotation) => {
            if (annotation.scenario_id !== ctx.scenarioId) {
              return null;
            }

            return (
              <AnnotationView
                key={annotation.id}
                deleteAnnotation={deleteAnnotation}
                {...annotation}
              />
            );
          })}
          <NewAnnotation
            blockId={blockId}
            notebookId={notbeookId}
            showNewAnnotation={showNewAnnotation}
            scenarioId={ctx.scenarioId}
            setShowNewAnnotation={setShowNewAnnotation}
          />
        </>
      )}
    </BlockContainer>
  );
};
