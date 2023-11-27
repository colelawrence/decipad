import { LoginPage, VerifyEmail } from '@decipad/ui';
import { signIn } from 'next-auth/react';
import { FC, useState } from 'react';
import { loadWorkspaces } from '../../App';
import { loadEditor } from '../../notebooks/notebook/Notebook';
import { useSearchParams } from 'react-router-dom';

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

  const [searchParams] = useSearchParams();

  switch (page.kind) {
    case 'initial':
      return (
        // proper back to login without url change
        <LoginPage
          email={searchParams.get('refemail')}
          onSubmit={async (email) => {
            try {
              setPage({ kind: 'email-sent', email });
              const resp = await signIn('email', {
                email,
                redirect: false,
                callbackUrl:
                  searchParams.get('redirectAfterLogin') ??
                  window.location.href,
              });
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
