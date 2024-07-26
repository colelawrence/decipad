import { UserIconKey } from '@decipad/editor-types';
import { render } from '@testing-library/react';
import { ToastDisplay } from 'libs/ui/src/shared';
import { ComponentProps, FC, PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { AvailableSwatchColor, TColorStatus } from '../../../utils';
import { NotebookListItem } from './NotebookListItem';

const asyncNoop = async () => null as any;

const props: ComponentProps<typeof NotebookListItem> = {
  permissionType: null,
  iconColor: 'Malibu' as AvailableSwatchColor,
  icon: 'Rocket' as UserIconKey,
  name: 'Getting started with Decipad',
  status: 'To Do' as TColorStatus,
  isPublic: true,
  id: '123',
  actions: {
    onDeleteNotebook: asyncNoop,
    onUnarchiveNotebook: asyncNoop,
    onDownloadNotebook: asyncNoop,
    onDownloadNotebookHistory: asyncNoop,
    onMoveToSection: asyncNoop,
    onMoveToWorkspace: asyncNoop,
    onChangeStatus: asyncNoop,
    onDuplicateNotebook: asyncNoop,
    onUpdatePublishState: asyncNoop,
    onPublishNotebook: asyncNoop,
    onUpdateAllowDuplicate: asyncNoop,
    onAddAlias: asyncNoop,
    onRemoveAlias: asyncNoop,
  },
  notebookId: '123',
  isArchived: false,
  workspaces: [],
  workspaceId: '456',
  onDuplicate: () => {},
};

const WithContexts: FC<PropsWithChildren> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    <ToastDisplay>
      <BrowserRouter>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          {children}
        </QueryParamProvider>
      </BrowserRouter>
    </ToastDisplay>
  </DndProvider>
);

it('links to the notebook with its name', () => {
  const { getByText } = render(
    <WithContexts>
      <NotebookListItem {...props} name="My Notebook" id="my-notebook" />
    </WithContexts>
  );
  expect(getByText('My Notebook').closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('my-notebook')
  );
});

it('renders a placeholder for an empty name', () => {
  const { getByText } = render(
    <WithContexts>
      <NotebookListItem {...props} name="" />
    </WithContexts>
  );
  expect(getByText(/my note(book|pad)/i)).toBeVisible();
});

it('renders the default icon', () => {
  const { getByTitle } = render(
    <WithContexts>
      <NotebookListItem {...props} name="" />
    </WithContexts>
  );
  expect(getByTitle(/rocket/i)).toBeInTheDocument();
});
