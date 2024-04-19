import { useAnnotations } from '@decipad/react-contexts';

import { useEffect, useMemo } from 'react';
import * as Styled from './styles';
import { ThumbnailChat } from 'libs/ui/src/icons/thumbnail-icons';
import { DragHandle } from 'libs/ui/src/icons';
import {
  GetNotebookAnnotationsQuery,
  useGetNotebookAnnotationsQuery,
} from '@decipad/graphql-client';

type AnnotationArray = NonNullable<
  GetNotebookAnnotationsQuery['getAnnotationsByPadId']
>;

type Annotation = NonNullable<AnnotationArray[number]>;

type AnnotationsProps = {
  notebookId: string;
};

export const Annotations: React.FC<AnnotationsProps> = ({ notebookId }) => {
  const { annotations, setAnnotations, expandedBlockId, setExpandedBlockId } =
    useAnnotations();

  const [annotationData] = useGetNotebookAnnotationsQuery({
    variables: {
      notebookId,
    },
    requestPolicy: 'network-only',
  });

  useEffect(() => {
    if (annotationData) {
      setAnnotations(
        annotationData.data?.getAnnotationsByPadId as Annotation[]
      );
    }
  }, [annotationData, setAnnotations]);

  const showPlaceholder = useMemo(
    () =>
      (annotations === undefined || annotations.length === 0) &&
      expandedBlockId === null,
    [annotations, expandedBlockId]
  );

  return (
    <Styled.Container
      id="annotations-container"
      onClick={() => {
        setExpandedBlockId(null);
      }}
    >
      {showPlaceholder && (
        <Styled.Placeholder>
          <Styled.PlaceholderIcon>
            <ThumbnailChat />
          </Styled.PlaceholderIcon>
          <Styled.HelperTitle>Be the first one to chat</Styled.HelperTitle>
          <Styled.HelperText>
            Click on the block{' '}
            <Styled.HelperIcon>
              <DragHandle />
            </Styled.HelperIcon>{' '}
            you want to comment on
          </Styled.HelperText>
        </Styled.Placeholder>
      )}
    </Styled.Container>
  );
};
