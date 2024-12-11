import { FC } from 'react';
import * as S from './styles';
import { Toggle } from '../../../shared';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import { isFlagEnabled } from '@decipad/feature-flags';

interface PublishControlsProps {
  readonly notebookId: string;
  readonly allowDuplicate: boolean;
  readonly onChangeAllowDuplicate: NotebookMetaActionsReturn['onUpdateAllowDuplicate'];
  readonly publishedStatus: S.NotebookPublishTabProps['publishingState'];
}

export const PublishControls: FC<PublishControlsProps> = ({
  notebookId,
  allowDuplicate,
  publishedStatus,
  onChangeAllowDuplicate,
}) => {
  if (
    publishedStatus !== 'PUBLIC' &&
    !isFlagEnabled('PRIVATE_LINK_ANALYTICS')
  ) {
    return null;
  }

  return (
    <S.PublishingControlsWrapper>
      <S.PublishingControlsItem>
        <Toggle
          label="Allow readers to duplicate"
          active={allowDuplicate}
          variant="small-toggle"
          onChange={(newActive) =>
            onChangeAllowDuplicate(notebookId, newActive)
          }
        />
      </S.PublishingControlsItem>
    </S.PublishingControlsWrapper>
  );
};
