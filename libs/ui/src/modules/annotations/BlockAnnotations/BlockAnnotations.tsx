import {
  GetNotebookAnnotationsQuery,
  useDeleteAnnotationMutation,
} from '@decipad/graphql-client';
import { useAnnotations, useNotebookId } from '@decipad/react-contexts';
import { CollapsedAnnotation } from '../CollapsedAnnotation/CollapsedAnnotation';
import { useVerticalOffset } from 'libs/ui/src/hooks';

import { NewAnnotation } from '../NewAnnotation/NewAnnotation';
import { SingleAnnotation } from '../SingleAnnotation/SingleAnnotation';

import * as Styled from './styles';
import { AnimatePresence } from 'framer-motion';
import { useCallback, FC } from 'react';

export type AnnotationArray = NonNullable<
  GetNotebookAnnotationsQuery['getAnnotationsByPadId']
>;

export type Annotation = NonNullable<AnnotationArray[number]>;

type BlockAnnotationsProps = Readonly<{
  blockId: string;
  blockRef: React.RefObject<HTMLElement>;
  setBlockHighlighted: (_value: boolean) => void;
}>;

type UseAnnotationActionsReturn = {
  onCollapseAnnotation: () => void;
  onExpandAnnotation: () => void;
  onDeleteAnnotation: (id: string) => void;
};

const useAnnotationActions = (blockId: string): UseAnnotationActionsReturn => {
  const { expandedBlockId, handleExpandedBlockId } = useAnnotations();

  const onCollapseAnnotation = useCallback(() => {
    if (blockId === expandedBlockId) {
      handleExpandedBlockId(null);
    }
  }, [handleExpandedBlockId, blockId, expandedBlockId]);

  const onExpandAnnotation = useCallback(() => {
    if (blockId !== expandedBlockId) {
      handleExpandedBlockId(blockId);
    }
  }, [handleExpandedBlockId, blockId, expandedBlockId]);

  const [, deleteAnnotation] = useDeleteAnnotationMutation();

  const onDeleteAnnotation = useCallback(
    (id: string) => {
      deleteAnnotation({ annotationId: id });
    },
    [deleteAnnotation]
  );

  return {
    onCollapseAnnotation,
    onExpandAnnotation,
    onDeleteAnnotation,
  };
};

const CurrentBlockAnnotations: FC<
  BlockAnnotationsProps & {
    blockAnnotations: Array<Annotation>;
    collapsed: boolean;
  }
> = ({
  blockId,
  blockRef,
  setBlockHighlighted,
  collapsed,
  blockAnnotations,
}) => {
  const offset = useVerticalOffset(blockRef);
  const notebookId = useNotebookId();
  const { onExpandAnnotation, onDeleteAnnotation } =
    useAnnotationActions(blockId);
  const { scenarioId } = useAnnotations();

  if (offset == null) {
    return null;
  }

  return (
    <AnimatePresence>
      <Styled.Annotation
        collapsed={collapsed}
        offset={offset}
        onMouseEnter={() => setBlockHighlighted(true)}
        onMouseLeave={() => setBlockHighlighted(false)}
      >
        {collapsed ? (
          <CollapsedAnnotation
            collapsed={collapsed}
            expandAnnotation={onExpandAnnotation}
            annotations={blockAnnotations}
          />
        ) : (
          <>
            {blockAnnotations.map((annotation) => {
              if (annotation.scenario_id !== scenarioId) {
                return null;
              }

              return (
                <SingleAnnotation
                  key={annotation.id}
                  deleteAnnotation={onDeleteAnnotation}
                  {...annotation}
                />
              );
            })}
            <NewAnnotation
              isReply={false}
              blockId={blockId}
              notebookId={notebookId}
              scenarioId={scenarioId}
            />
          </>
        )}
      </Styled.Annotation>
    </AnimatePresence>
  );
};

const NewBlockAnnotations: FC<BlockAnnotationsProps> = ({
  blockId,
  blockRef,
}) => {
  const offset = useVerticalOffset(blockRef);
  const { scenarioId } = useAnnotations();
  const notebookId = useNotebookId();

  if (offset == null) {
    return null;
  }

  return (
    <AnimatePresence>
      <Styled.Annotation collapsed={false} offset={offset}>
        <NewAnnotation
          isReply={true}
          blockId={blockId}
          notebookId={notebookId}
          scenarioId={scenarioId}
        />
      </Styled.Annotation>
    </AnimatePresence>
  );
};

export const BlockAnnotations: FC<BlockAnnotationsProps> = (props) => {
  const { annotations, expandedBlockId, scenarioId } = useAnnotations();

  const collapsed = expandedBlockId !== props.blockId;

  if (annotations == null) {
    return null;
  }

  // TODO
  //
  // Move this following code into `useAnnotations`,
  // And make it Record<string, Array<Annotations>>.
  // It would simply (plus speed up), these.

  const blockAnnotations = annotations.filter(
    (annotation): annotation is Annotation =>
      annotation?.block_id === props.blockId &&
      annotation?.scenario_id === scenarioId
  );

  blockAnnotations.sort((a, b) => {
    return (
      new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
    );
  });

  //
  // If no block annotations exist, but we aren't collapsed,
  // then the user is creating a new annotation.
  //
  if (blockAnnotations.length === 0 && !collapsed) {
    return <NewBlockAnnotations {...props} />;
  }

  //
  // Otherwise, we do have some annotations, so we must show them to the user.
  // These could be collapsed or opened.
  //

  if (blockAnnotations.length > 0) {
    return (
      <CurrentBlockAnnotations
        {...props}
        blockAnnotations={blockAnnotations}
        collapsed={collapsed}
      />
    );
  }

  return null;
};
