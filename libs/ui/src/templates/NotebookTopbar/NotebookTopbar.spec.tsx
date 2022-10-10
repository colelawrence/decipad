import { ClientEventsContext } from '@decipad/client-events';
import { mockConsoleError } from '@decipad/testutils';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { ComponentProps, FC, ReactNode } from 'react';
import { NotebookTopbar } from './NotebookTopbar';

const props: ComponentProps<typeof NotebookTopbar> = {
  notebook: { id: 'nbid', name: 'My first notebook' },
  workspace: {
    id: 'wsid',
    name: "John's Workspace",
  },
  permission: 'ADMIN',
  usersWithAccess: [
    {
      user: { id: '1', name: 'John Doe' },
      permission: 'ADMIN',
    },
  ],
};

interface WithProvidersProps {
  children: ReactNode;
  noSession?: boolean;
}

const WithProviders: FC<WithProvidersProps> = ({ children, noSession }) => (
  <ClientEventsContext.Provider value={noop}>
    <SessionProvider
      session={
        noSession
          ? null
          : {
              user: {},
              expires: new Date(Date.now() + 100000000).toISOString(),
            }
      }
    >
      {children}
    </SessionProvider>
  </ClientEventsContext.Provider>
);

describe('Notebook Topbar', () => {
  mockConsoleError();

  it('renders the try decipad button only for non authenticated userz', () => {
    {
      const { queryByText } = render(
        <WithProviders>
          <NotebookTopbar {...props} permission="READ" />
        </WithProviders>
      );
      expect(queryByText(/try decipad/i)).not.toBeInTheDocument();
    }

    {
      const { getByText } = render(
        <WithProviders noSession>
          <NotebookTopbar {...props} permission="READ" />
        </WithProviders>
      );
      expect(getByText(/try decipad/i)).toHaveAttribute(
        'href',
        expect.stringMatching(/typeform/i)
      );
    }
  });

  it('renders the duplicate button only when not admin', () => {
    const { getByText, queryByText, rerender } = render(
      <WithProviders>
        <NotebookTopbar {...props} permission="ADMIN" />
      </WithProviders>
    );
    expect(queryByText(/dup/i)).not.toBeInTheDocument();

    rerender(
      <WithProviders>
        <NotebookTopbar {...props} permission="READ" />
      </WithProviders>
    );
    expect(getByText(/dup/i)).toBeVisible();
  });

  it('renders the share button only when write or admin', () => {
    const { getByText, queryByText, rerender } = render(
      <WithProviders>
        <NotebookTopbar {...props} permission="WRITE" />
      </WithProviders>
    );
    expect(queryByText(/share/i)).toBeVisible();

    rerender(
      <WithProviders>
        <NotebookTopbar {...props} permission="ADMIN" />
      </WithProviders>
    );
    expect(getByText(/share/i)).toBeVisible();
  });
});
