import { DashboardTopbar } from '@decipad/ui';
import { signOut, useSession } from 'next-auth/react';
import { ComponentProps, FC } from 'react';

type TopbarProps = {
  readonly numberOfNotebooks: number;
} & Required<Pick<ComponentProps<typeof DashboardTopbar>, 'onCreateNotebook'>>;

export const Topbar = ({
  numberOfNotebooks,
  onCreateNotebook,
}: TopbarProps): ReturnType<FC> => {
  const { data: session } = useSession();
  if (!session?.user) {
    throw new Error(
      'The dashboard topbar requires an active session and user account'
    );
  }

  return (
    <DashboardTopbar
      name={session.user.name ?? ''}
      email={session.user.email ?? ''}
      onLogout={signOut}
      onCreateNotebook={onCreateNotebook}
      numberOfNotebooks={numberOfNotebooks}
    />
  );
};
