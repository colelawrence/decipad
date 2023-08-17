import { render } from '@testing-library/react';
import { ComponentProps, FC, PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryParamProvider } from 'use-query-params';
import { BrowserRouter } from 'react-router-dom';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { NotebookListItem } from './NotebookListItem';
import { noop } from '@decipad/utils';

const props: ComponentProps<typeof NotebookListItem> = {
  id: 'my-notebook',
  name: 'My Notebook',
  icon: 'Rocket',
  status: 'draft',
  iconColor: 'Catskill',
  isPublic: false,
  onDelete: noop,
  onMoveToSection: noop,
  onDuplicate: noop as any,
  onChangeStatus: noop,
  onExport: noop,
  onUnarchive: noop,
  onExportBackups: noop,
  onMoveWorkspace: noop,
  workspaces: [],
  notebookId: '123',
  isArchived: false,
};

const WithContexts: FC<PropsWithChildren> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        {children}
      </QueryParamProvider>
    </BrowserRouter>
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
