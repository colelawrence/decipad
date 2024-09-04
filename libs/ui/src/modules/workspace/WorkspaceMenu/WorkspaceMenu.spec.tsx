import { it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, FC, PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryParamProvider } from 'use-query-params';
import { BrowserRouter } from 'react-router-dom';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { WorkspaceMenu } from './WorkspaceMenu';
import { noop } from '@decipad/utils';

const props: ComponentProps<typeof WorkspaceMenu> = {
  workspaces: [
    {
      id: '42',
      membersCount: 2,
      name: 'Some Workspace',
      sections: [],
    },
    {
      id: '1337',
      membersCount: 2,
      name: 'Some Other Workspace',
      sections: [],
    },
  ],
  onCreateWorkspace: noop,
  onSelectWorkspace: noop,
  getPlanTitle: () => 'bruh',
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

it('renders a button to create a workspace', async () => {
  const handleCreateWorkspace = vi.fn();
  const { getByText } = render(
    <WithContexts>
      <WorkspaceMenu {...props} onCreateWorkspace={handleCreateWorkspace} />
    </WithContexts>
  );

  await userEvent.click(getByText(/create/i));
  expect(handleCreateWorkspace).toHaveBeenCalled();
});

it('renders the workspaces', () => {
  const { getByText } = render(
    <WithContexts>
      <WorkspaceMenu {...props} />
    </WithContexts>
  );

  expect(getByText('Some Workspace')).toBeVisible();
  expect(getByText('Some Other Workspace')).toBeVisible();
});
