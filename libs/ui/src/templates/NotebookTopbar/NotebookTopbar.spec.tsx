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
import { PermissionType } from '@decipad/graphql-client';
// eslint-disable-next-line no-restricted-imports
import { IntercomProvider } from 'react-use-intercom';

const noop = () => Promise.resolve();

const props: ComponentProps<typeof NotebookTopbar> = {
  sidebarOpen: true,
  canRedo: true,
  canUndo: true,
  onUndo: noop,
  onRedo: noop,
  isNewNotebook: true,
  onClearAll: noop,
  isEmbed: false,
  toggleSidebar: noop,
  notebookMeta: undefined,
  notebookMetaActions: {
    onChangeStatus: noop,
    onMoveToSection: noop,
    onDeleteNotebook: noop,
    onMoveToWorkspace: noop,
    onPublishNotebook: noop,
    onDownloadNotebook: noop,
    onDuplicateNotebook: noop as any,
    onUnarchiveNotebook: noop,
    onUnpublishNotebook: noop,
    onDownloadNotebookHistory: noop,
  },
  notebookAccessActions: {
    onChangeAccess: noop,
    onRemoveAccess: noop,
    onInviteByEmail: noop,
  },
  userWorkspaces: [],
  hasUnpublishedChanges: false,
  toggleAIMode: noop,
  aiMode: false,
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
      <IntercomProvider appId="">
        <DndProvider backend={HTML5Backend}>
          <BrowserRouter>
            <QueryParamProvider adapter={ReactRouter6Adapter}>
              {children}
            </QueryParamProvider>
          </BrowserRouter>
        </DndProvider>
      </IntercomProvider>
    </SessionProvider>
  </ClientEventsContext.Provider>
);

describe('Notebook Topbar', () => {
  mockConsoleError();

  it('renders the try decipad button only for non authenticated users', () => {
    {
      const { queryByText } = render(
        <WithProviders>
          <NotebookTopbar {...props} />
        </WithProviders>
      );
      expect(queryByText(/try decipad/i)).not.toBeInTheDocument();
      expect(queryByText(/reading mode/i)).toBeInTheDocument();
    }

    {
      const { getByText } = render(
        <WithProviders noSession>
          <NotebookTopbar {...props} />
        </WithProviders>
      );
      expect(getByText(/try decipad/i).parentNode).toHaveAttribute(
        'href',
        expect.stringMatching('/')
      );
    }
  });

  it('renders the publish button only for admin', () => {
    const { queryByText, rerender } = render(
      <WithProviders>
        <NotebookTopbar
          {...props}
          notebookMeta={{
            id: 'id',
            name: 'name',
            myPermissionType: PermissionType.Read,
            snapshots: [],
            access: {
              id: 'id',
            },
          }}
        />
      </WithProviders>
    );
    expect(queryByText(/share/i, {})).toBeNull();

    rerender(
      <WithProviders>
        <NotebookTopbar
          {...props}
          notebookMeta={{
            id: 'id',
            name: 'name',
            myPermissionType: PermissionType.Admin,
            snapshots: [],
            access: {
              id: 'id',
            },
          }}
        />
      </WithProviders>
    );
    expect(queryByText(/share/i)).toBeVisible();
  });
});

it('renders well for writers', () => {
  const { queryByText } = render(
    <WithProviders>
      <NotebookTopbar
        {...props}
        notebookMeta={{
          id: 'id',
          name: 'name',
          myPermissionType: PermissionType.Write,
          snapshots: [],
          access: {
            id: 'id',
          },
        }}
      />
    </WithProviders>
  );
  expect(queryByText(/try decipad/i)).not.toBeInTheDocument();
  expect(queryByText(/reading mode/i)).not.toBeInTheDocument();
});
