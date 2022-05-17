import { ClientEventsContext } from '@decipad/client-events';
import { mockConsoleError } from '@decipad/testutils';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { Provider as SessionProvider } from 'next-auth/client';
import { ComponentProps, FC } from 'react';
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

const WithProviders: FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <ClientEventsContext.Provider value={noop}>
    <SessionProvider session={{ user: {} }}>{children}</SessionProvider>
  </ClientEventsContext.Provider>
);

describe('Notebook Topbar', () => {
  mockConsoleError();

  it('renders the try decipad button only for non authenticated userz', () => {
    const { getByText, queryByText, rerender } = render(
      <WithProviders>
        <NotebookTopbar {...props} permission="READ" />
      </WithProviders>
    );
    expect(queryByText(/try decipad/i)).not.toBeInTheDocument();

    rerender(<NotebookTopbar {...props} permission="READ" />);
    expect(getByText(/try decipad/i)).toHaveAttribute(
      'href',
      expect.stringMatching(/typeform/i)
    );
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

  it("doesn't render the need help button when shared", () => {
    const { getByText, rerender, queryByText } = render(
      <WithProviders>
        <NotebookTopbar {...props} permission="ADMIN" />
      </WithProviders>
    );

    expect(getByText(/help/i)).toBeInTheDocument();

    rerender(
      <WithProviders>
        <NotebookTopbar {...props} permission="READ" />
      </WithProviders>
    );

    expect(queryByText(/help/i)).not.toBeInTheDocument();
  });
});
