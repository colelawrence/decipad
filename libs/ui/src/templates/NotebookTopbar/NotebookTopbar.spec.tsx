import { ClientEventsContext } from '@decipad/client-events';
import { mockConsoleError } from '@decipad/testutils';
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { ComponentProps, FC, ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { NotebookTopbar } from './NotebookTopbar';

const noop = () => Promise.resolve();

const props: ComponentProps<typeof NotebookTopbar> = {
  notebook: { id: 'nbid', name: 'My first notebook' },
  workspace: {
    id: 'wsid',
    name: "John's Workspace",
  },
  permission: 'ADMIN',
  usersWithAccess: [
    {
      user: { id: '1', name: 'John Doe', email: 'foo@nar.com' },
      permission: 'ADMIN',
    },
  ],
  sidebarOpen: true,
  status: 'draft',
  notebookId: 'id',
  onChangeStatus: () => {},
  isReadOnly: false,
  canRedo: true,
  canUndo: true,
  onUndo: () => {},
  onRedo: () => {},
  onDuplicate: noop as any,
  isArchived: false,
  onExport: noop,
  onExportBackups: noop,
  onUnarchive: noop,
  onDelete: noop,
  isNewNotebook: true,
  onClearAll: noop,
  onMoveWorkspace: noop,
  workspaces: [],
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
              user: { email: 'test@decipad.com' },
              expires: new Date(Date.now() + 100000000).toISOString(),
            }
      }
    >
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            {children}
          </QueryParamProvider>
        </BrowserRouter>
      </DndProvider>
    </SessionProvider>
  </ClientEventsContext.Provider>
);

describe('Notebook Topbar', () => {
  mockConsoleError();

  it('renders the try decipad button only for non authenticated users', () => {
    {
      const { queryByText } = render(
        <WithProviders>
          <NotebookTopbar {...props} permission="READ" />
        </WithProviders>
      );
      expect(queryByText(/try decipad/i)).not.toBeInTheDocument();
      expect(queryByText(/reading mode/i)).toBeInTheDocument();
    }

    {
      const { getByText } = render(
        <WithProviders noSession>
          <NotebookTopbar {...props} permission="READ" />
        </WithProviders>
      );
      expect(getByText(/try decipad/i).parentNode).toHaveAttribute(
        'href',
        expect.stringMatching('/')
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
    expect(queryByText(/templates/i)).toBeInTheDocument();
    expect(queryByText(/sidebar/i)).toBeInTheDocument();

    rerender(
      <WithProviders>
        <NotebookTopbar {...props} permission="READ" />
      </WithProviders>
    );
    expect(getByText(/dup/i)).toBeVisible();
  });

  it('renders the publish button only for admin', () => {
    const { getByText, queryByText, rerender } = render(
      <WithProviders>
        <NotebookTopbar {...props} permission="READ" />
      </WithProviders>
    );
    expect(queryByText(/share/i, {})).toBeNull();

    rerender(
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

it('renders well for writers', () => {
  const { queryByText } = render(
    <WithProviders>
      <NotebookTopbar {...props} permission="WRITE" />
    </WithProviders>
  );
  expect(queryByText(/try decipad/i)).not.toBeInTheDocument();
  expect(queryByText(/reading mode/i)).not.toBeInTheDocument();
});
