import { useMemo, FC } from 'react';
import * as Styled from './styles';
import { ThumbnailChat } from 'libs/ui/src/icons/thumbnail-icons';
import { DragHandle } from 'libs/ui/src/icons';
import { useActiveElement } from '@decipad/react-utils';
import { useAnnotations } from '@decipad/notebook-state';

export const Annotations: FC = () => {
  // TODO THIS ONE
  const { annotations, expandedBlockId, handleExpandedBlockId } =
    useAnnotations();

  const containerRef = useActiveElement(() => handleExpandedBlockId(undefined));

  const showPlaceholder = useMemo(
    () =>
      (annotations === undefined || annotations.length === 0) &&
      expandedBlockId === null,
    [annotations, expandedBlockId]
  );

  return (
    <Styled.Container id="annotations-container" ref={containerRef}>
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
