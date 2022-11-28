import { ClientEventsContext } from '@decipad/client-events';
import { docs } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { FC, useCallback, useContext } from 'react';
import { GenericCursorAdd } from '../../icons';

import { DashboardDialogCTA } from '../DashboardDialogCTA/DashboardDialogCTA';

interface EmptyWorkspaceCtaProps {
  readonly onCreateNotebook?: () => void;
}

export const EmptyWorkspaceCta = ({
  onCreateNotebook = noop,
}: EmptyWorkspaceCtaProps): ReturnType<FC> => {
  const clientEvent = useContext(ClientEventsContext);

  const onGalleryClick = useCallback(
    () =>
      clientEvent({
        type: 'action',
        action: 'notebook get inspiration link clicked',
      }),
    [clientEvent]
  );
  return (
    <DashboardDialogCTA
      icon={<GenericCursorAdd />}
      primaryAction={onCreateNotebook}
      primaryText={'Create your first document'}
      primaryActionLabel={'Create new notebook'}
      secondaryText={'Start modelling your finances, your work, etc'}
      secondaryActionLabel={'Explore our gallery'}
      secondaryAction={onGalleryClick}
      secondaryActionHref={docs({}).page({ name: 'gallery' }).$}
    />
  );
};
