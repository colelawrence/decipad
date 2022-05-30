import { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkspaceMenu } from './WorkspaceMenu';

const props: ComponentProps<typeof WorkspaceMenu> = {
  Heading: 'h1',
  activeWorkspace: {
    id: '42',
    name: 'Active Workspace',
    numberOfMembers: 1,
  },
  otherWorkspaces: [],
};

it('renders a heading at given level', () => {
  const { getByRole } = render(<WorkspaceMenu {...props} Heading="h1" />);
  expect(getByRole('heading').tagName).toBe('H1');
});

it('renders a button to create a workspace', async () => {
  const handleCreateWorkspace = jest.fn();
  const { getByTitle } = render(
    <WorkspaceMenu {...props} onCreateWorkspace={handleCreateWorkspace} />
  );

  await userEvent.click(getByTitle(/create/i));
  expect(handleCreateWorkspace).toHaveBeenCalled();
});

it('links to the active workspace', () => {
  const { getByText } = render(
    <WorkspaceMenu
      {...props}
      activeWorkspace={{
        ...props.activeWorkspace,
        id: '42',
        name: 'Some Workspace',
      }}
    />
  );
  expect(getByText('Some Workspace').closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('42')
  );
});
it('links to the other workspaces', () => {
  const { getByText } = render(
    <WorkspaceMenu
      {...props}
      otherWorkspaces={[
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

it('shows a separator if there are other workspaces', () => {
  const { getByRole, queryByRole, rerender } = render(
    <WorkspaceMenu {...props} otherWorkspaces={[]} />
  );
  expect(queryByRole('separator')).not.toBeInTheDocument();

  rerender(
    <WorkspaceMenu
      {...props}
      otherWorkspaces={[
        {
          id: '0',
          numberOfMembers: 2,
          name: 'Some Workspace',
        },
      ]}
    />
  );
  expect(getByRole('separator')).toBeVisible();
});
