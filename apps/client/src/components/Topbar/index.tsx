import { ComponentProps, FC } from 'react';
import { useQuery } from '@apollo/client';
import { CountPads, CountPadsVariables, COUNT_PADS } from '@decipad/queries';
import { DashboardTopbar } from '@decipad/ui';
import { signOut, useSession } from 'next-auth/client';

type TopbarProps = {
  readonly workspaceId: string;
} & Required<Pick<ComponentProps<typeof DashboardTopbar>, 'onCreateNotebook'>>;

export const Topbar = ({
  workspaceId,
  onCreateNotebook,
}: TopbarProps): ReturnType<FC> => {
  const [session] = useSession();
  if (!session || !session.user) {
    throw new Error(
      'The dashboard topbar requires an active session and user account'
    );
  }

  const { data } = useQuery<CountPads, CountPadsVariables>(COUNT_PADS, {
    variables: { workspaceId },
  });

  return (
    <DashboardTopbar
      name={session.user.name}
      email={session.user.email ?? ''}
      onLogout={signOut}
      onCreateNotebook={onCreateNotebook}
      numberOfNotebooks={data?.pads.count}
    />
  );
};
