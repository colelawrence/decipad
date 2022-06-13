import { ErrorPage as ErrorPageUi } from '@decipad/ui';
import { useSession } from 'next-auth/react';
import { FC, ComponentProps } from 'react';

export const ErrorPage: FC<
  Omit<ComponentProps<typeof ErrorPageUi>, 'authenticated'>
> = (props) => {
  const { data: session } = useSession();
  return <ErrorPageUi {...props} authenticated={!!session} />;
};
