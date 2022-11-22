import { FC, useState } from 'react';
import { signIn } from 'next-auth/react';
import { ErrorPage, LoginPage, VerifyEmail } from '@decipad/ui';
import { loadWorkspaces } from '../../App';

type Status =
  | {
      kind: 'initial';
    }
  | {
      kind: 'success';
      email: string;
    }
  | {
      kind: 'error';
    };

export const Login: FC = () => {
  const [status, setStatus] = useState<Status>({ kind: 'initial' });

  switch (status.kind) {
    case 'initial':
      return (
        // proper back to login without url change
        <LoginPage
          onSubmit={async (email) => {
            try {
              await signIn('email', { email, redirect: false });
              setStatus({ kind: 'success', email });
              // User will likely click the link in the email now, so let's get workspaces cached already for faster load
              loadWorkspaces();
            } catch (error) {
              console.error('Failed to log in', error);
              setStatus({ kind: 'error' });
            }
          }}
        />
      );
    case 'success':
      return <VerifyEmail email={status.email} />;
    case 'error':
      return <ErrorPage Heading="h1" />;
  }
};
