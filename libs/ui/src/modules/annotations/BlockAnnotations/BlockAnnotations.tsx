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
import { useActiveElement } from '@decipad/react-utils';
import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

export type AnnotationArray = NonNullable<
  GetNotebookAnnotationsQuery['getAnnotationsByPadId']
>;

export type Annotation = NonNullable<AnnotationArray[number]>;

export const BlockAnnotations = ({
  blockId,
  blockRef,
  setBlockHighlighted,
}: {
  blockId: string;
  blockRef: React.RefObject<HTMLElement>;
  setBlockHighlighted: (value: boolean) => void;
}) => {
  const {
    annotations,
    articleRef,
    expandedBlockId,
    handleExpandedBlockId,
    scenarioId,
  } = useAnnotations();
  const notbeookId = useNotebookId();

  const collapseAnnotation = useCallback(() => {
    if (blockId === expandedBlockId) {
      handleExpandedBlockId(null);
    }
  }, [handleExpandedBlockId, blockId, expandedBlockId]);

  const expandAnnotation = useCallback(() => {
    if (blockId !== expandedBlockId) {
      handleExpandedBlockId(blockId);
    }
  }, [handleExpandedBlockId, blockId, expandedBlockId]);

  const [, deleteAnnotation] = useDeleteAnnotationMutation();
  const containerRef = useActiveElement(() => {
    collapseAnnotation();
  });

  const offset = useVerticalOffset(articleRef, blockRef);

  const [scrollY, setScrollY] = useState(0);

  const onDeleteAnnotation = useCallback(
    (id: string) => {
      deleteAnnotation({ annotationId: id });
    },
    [deleteAnnotation]
  );

  const updateScrollPosition = debounce((scrollValue: number) => {
    setScrollY(scrollValue);
  }, 50);

  useEffect(() => {
    let requestID: number | null = null;

    const handleScroll = () => {
      if (requestID !== null) {
        cancelAnimationFrame(requestID);
      }

      requestID = requestAnimationFrame(() => {
        updateScrollPosition(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (requestID !== null) {
        cancelAnimationFrame(requestID);
      }
    };
  }, [updateScrollPosition]);

  const collapsed = expandedBlockId !== blockId;

  if (annotations === undefined) {
    return null;
  }

  const blockAnnotations = annotations.filter(
    (annotation): annotation is Annotation => annotation?.block_id === blockId
  );

  if (blockAnnotations.length === 0 && expandedBlockId === blockId) {
    return (
      <AnimatePresence>
        <Styled.Annotation
          layoutScroll
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -10,
          }}
          collapsed={false}
          offset={offset}
          scroll={scrollY}
          ref={containerRef}
        >
          <NewAnnotation
            isReply={true}
            blockId={blockId}
            notebookId={notbeookId}
            scenarioId={scenarioId}
          />
        </Styled.Annotation>
      </AnimatePresence>
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
      (annotation) => annotation.scenario_id !== scenarioId
    )
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      <Styled.Annotation
        scroll={scrollY}
        collapsed={collapsed}
        offset={offset}
        ref={containerRef}
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
          maxHeight: `calc(100vh - ${offset}px + ${scrollY}px - 96px)`,
        }}
        exit={{
          opacity: 0,
          y: -10,
        }}
        onMouseEnter={() => setBlockHighlighted(true)}
        onMouseLeave={() => setBlockHighlighted(false)}
      >
        {collapsed ? (
          <CollapsedAnnotation
            collapsed={collapsed}
            expandAnnotation={expandAnnotation}
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
              notebookId={notbeookId}
              scenarioId={scenarioId}
            />
          </>
        )}
      </Styled.Annotation>
    </AnimatePresence>
  );
};
