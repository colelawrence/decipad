import { FC, useState } from 'react';
import { signIn } from 'next-auth/react';
import { ErrorPage, LoginPage, VerifyEmail } from '@decipad/ui';
import { loadWorkspaces } from '../../App';

export const Login: FC = () => {
  const [status, setStatus] = useState<'initial' | 'success' | 'error'>(
    'initial'
  );

  switch (status) {
    case 'initial':
      return (
        // proper back to login without url change
        <LoginPage
          onSubmit={async (email) => {
            try {
              await signIn('email', { email, redirect: false });
              setStatus('success');
              // User will likely click the link in the email now, so let's get workspaces cached already for faster load
              loadWorkspaces();
            } catch (error) {
              console.error('Failed to sign in', error);
              setStatus('error');
            }
          }}
        />
      );
    case 'success':
      return <VerifyEmail />;
    case 'error':
      return <ErrorPage Heading="h1" />;
  }
};
