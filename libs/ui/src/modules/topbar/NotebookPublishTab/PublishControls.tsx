import { FC } from 'react';
import * as S from './styles';
import { Toggle } from '../../../shared';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import { isFlagEnabled } from '@decipad/feature-flags';

interface PublishControlsProps {
  readonly notebookId: string;
  readonly publishedStatus: S.NotebookPublishTabProps['publishingState'];
  readonly allowDuplicate: boolean;
  readonly onChangeAllowDuplicate: NotebookMetaActionsReturn['onUpdateAllowDuplicate'];
}

export const PublishControls: FC<PublishControlsProps> = ({
  notebookId,
  publishedStatus,
  allowDuplicate,
  onChangeAllowDuplicate,
}) => {
  if (publishedStatus !== 'PUBLIC' || !isFlagEnabled('NEW_PAYMENTS')) {
    return null;
  }

  return (
    <S.PublishingControlsWrapper>
      <S.PublishingControlsItem>
        <S.Text>Allow readers to duplicate</S.Text>
        <Toggle
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
