import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, FC, PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryParamProvider } from 'use-query-params';
import { BrowserRouter } from 'react-router-dom';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { WorkspaceMenu } from './WorkspaceMenu';

const props: ComponentProps<typeof WorkspaceMenu> = {
  Heading: 'h1',
  activeWorkspace: {
    id: '42',
    name: 'Active Workspace',
    numberOfMembers: 1,
    sections: [],
  },
  allWorkspaces: [],
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

it('renders a heading at given level', () => {
  const { getByRole } = render(
    <WithContexts>
      <WorkspaceMenu {...props} Heading="h1" />
    </WithContexts>
  );
  expect(getByRole('heading').tagName).toBe('H1');
});

it('renders a button to create a workspace', async () => {
  const handleCreateWorkspace = jest.fn();
  const { getByText } = render(
    <WithContexts>
      <WorkspaceMenu {...props} onCreateWorkspace={handleCreateWorkspace} />
    </WithContexts>
  );

  await userEvent.click(getByText(/create/i));
  expect(handleCreateWorkspace).toHaveBeenCalled();
});

it('links to the active workspace', () => {
  const activeWorkspace = {
    ...props.activeWorkspace,
    id: '42',
    name: 'Some Workspace',
  };
  const allWorkspaces = [activeWorkspace];

  const { getByText } = render(
    <WithContexts>
      <WorkspaceMenu
        Heading="h1"
        allWorkspaces={allWorkspaces}
        activeWorkspace={activeWorkspace}
      />
    </WithContexts>
  );
  expect(getByText('Some Workspace').closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('42')
  );
});
it('links to the other workspaces', () => {
  const { getByText } = render(
    <WithContexts>
      <WorkspaceMenu
        {...props}
        allWorkspaces={[
          {
            id: '42',
            numberOfMembers: 2,
            name: 'Some Workspace',
          },
          {
            id: '1337',
            numberOfMembers: 2,
            name: 'Other Workspace',
          },
        ]}
      />
    </WithContexts>
  );
  expect(getByText('Some Workspace').closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('42')
  );
  expect(getByText('Other Workspace').closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('1337')
  );
});
