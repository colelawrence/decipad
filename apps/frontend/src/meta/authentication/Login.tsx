import { LoginPage, VerifyEmail } from '@decipad/ui';
import { signIn } from 'next-auth/react';
import { FC, useState } from 'react';
import { loadWorkspaces } from '../../App';
import { loadEditor } from '../../notebooks/notebook/Notebook';

type Page =
  | {
      kind: 'initial';
    }
  | {
      kind: 'email-sent';
      email: string;
    };

export const Login: FC = () => {
  const [page, setPage] = useState<Page>({ kind: 'initial' });

  switch (page.kind) {
    case 'initial':
      return (
        // proper back to login without url change
        <LoginPage
          onSubmit={async (email) => {
            try {
              setPage({ kind: 'email-sent', email });
              const resp = await signIn('email', { email, redirect: false });
              if (resp && resp.ok) {
                // Aggressively pre-load stuff for user
                loadWorkspaces();
                loadEditor();
              }
            } catch (error) {
              console.error('Failed to log in', error);
            }
          }}
        />
      );
    case 'email-sent':
      return <VerifyEmail email={page.email} />;
  }
};
