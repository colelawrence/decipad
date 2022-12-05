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
      error: string;
    };

const errorMessage = (error: string) => {
  if (error.startsWith('Error:')) {
    return error.substring('Error:'.length);
  }
  return error;
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
              const resp = await signIn('email', { email, redirect: false });
              if (!resp) {
                setStatus({ kind: 'error', error: 'No response' });
              } else if (resp.ok) {
                setStatus({ kind: 'success', email });
                // User will likely click the link in the email now, so let's get workspaces cached already for faster load
                loadWorkspaces();
              } else {
                setStatus({
                  kind: 'error',
                  error: resp.error
                    ? errorMessage(resp.error.trim())
                    : 'Unknown error',
                });
              }
            } catch (error) {
              console.error('Failed to log in', error);
              setStatus({ kind: 'error', error: (error as Error).message });
            }
          }}
        />
      );
    case 'success':
      return <VerifyEmail email={status.email} />;
    case 'error':
      return <ErrorPage Heading="h1" messages={status.error.split('.')} />;
  }
};
