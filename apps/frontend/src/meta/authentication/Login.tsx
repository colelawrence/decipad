import { LoginPage, VerifyEmail } from '@decipad/ui';
import { signIn } from 'next-auth/react';
import type { FC } from 'react';
import { useState } from 'react';
import { loadWorkspaces } from '../../App';
import { useSearchParams } from 'react-router-dom';
import { Loaders } from '../../notebooks/notebook/LoadComponents';

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
              const loc = new URL(window.location.toString());
              const resp = await signIn(
                'email',
                {
                  email,
                  redirect: false,
                  callbackUrl:
                    searchParams.get('redirectAfterLogin') ?? loc.toString(),
                },
                loc.searchParams
              );
              if (resp && resp.ok) {
                // Aggressively pre-load stuff for user
                loadWorkspaces();
                Loaders.loadEditor();
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
