import { ErrorPage as ErrorPageUi } from '@decipad/ui';
import { useSession } from 'next-auth/react';
import { FC, ComponentProps, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const messagesFromError: Record<string, string[]> = {
  Verification: [
    'It looks like your login link has expired. ',
    "You'll need to request a new login link",
  ],
};

const backUrlFromError: Record<string, string> = {
  Verification: '/',
};

const backCallFromError: Record<string, string> = {
  Verification: 'Click here to request a new one',
};

const defaultErrorMessage = [
  "Sorry, some error happened, we're not sure why.",
  'Please contact support.',
  'Sorry again!',
];

export const ErrorPage: FC<
  Omit<ComponentProps<typeof ErrorPageUi>, 'authenticated'>
> = (props) => {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const errorCode = params.get('error') as keyof (typeof messagesFromError &
    typeof backUrlFromError &
    typeof backCallFromError);

  const messages = messagesFromError[errorCode] || defaultErrorMessage;

  const { data: session } = useSession();

  return (
    <ErrorPageUi
      {...props}
      authenticated={!!session}
      messages={messages}
      backUrl={backUrlFromError[errorCode]}
      backCall={backCallFromError[errorCode]}
    />
  );
};
