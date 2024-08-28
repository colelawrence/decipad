import { useAnnotations } from '@decipad/notebook-state';
import { useActiveElement } from '@decipad/react-utils';
import { DragHandle } from 'libs/ui/src/icons';
import { ThumbnailChat } from 'libs/ui/src/icons/thumbnail-icons';
import { FC, useMemo } from 'react';
import * as Styled from './styles';

export const Annotations: FC = () => {
  // TODO THIS ONE
  const { annotations, expandedBlockId, handleExpandedBlockId } =
    useAnnotations();

  const containerRef = useActiveElement(() => handleExpandedBlockId(undefined));

  const showPlaceholder = useMemo(
    () =>
      (annotations == null || annotations.length === 0) &&
      expandedBlockId == null,
    [annotations, expandedBlockId]
  );

  return (
    <Styled.AnnotationContainer
      id="annotations-container"
      data-testid={'comment-sidebar'}
      ref={containerRef}
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
    </Styled.AnnotationContainer>
  );
};
