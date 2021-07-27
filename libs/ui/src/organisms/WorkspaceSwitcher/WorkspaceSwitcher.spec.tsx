import { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkspaceSwitcher } from './WorkspaceSwitcher';

const props: ComponentProps<typeof WorkspaceSwitcher> = {
  Heading: 'h1',
  activeWorkspace: {
    name: 'Active Workspace',
    href: '',
    numberOfMembers: 1,
  },
  otherWorkspaces: [],
};

it('renders a heading at given level', () => {
  const { getByRole } = render(<WorkspaceSwitcher {...props} Heading="h1" />);
  expect(getByRole('heading').tagName).toBe('H1');
});

it('renders a button to create a workspace', () => {
  const handleCreateWorkspace = jest.fn();
  const { getByTitle } = render(
    <WorkspaceSwitcher {...props} onCreateWorkspace={handleCreateWorkspace} />
  );

  userEvent.click(getByTitle(/create/i));
  expect(handleCreateWorkspace).toHaveBeenCalled();
});

it('links to the active workspace', () => {
  const { getByText } = render(
    <WorkspaceSwitcher
      {...props}
      activeWorkspace={{
        ...props.activeWorkspace,
        name: 'Some Workspace',
        href: '/some-workspace',
      }}
    />
  );
  expect(getByText('Some Workspace').closest('a')).toHaveAttribute(
    'href',
    '/some-workspace'
  );
});
it('links to the other workspaces', () => {
  const { getByText } = render(
    <WorkspaceSwitcher
      {...props}
      otherWorkspaces={[
        {
          id: '0',
          numberOfMembers: 2,
          name: 'Some Workspace',
          href: '/some-workspace',
        },
        {
          id: '1',
          numberOfMembers: 2,
          name: 'Other Workspace',
          href: '/other-workspace',
        },
      ]}
    />
  );
  expect(getByText('Some Workspace').closest('a')).toHaveAttribute(
    'href',
    '/some-workspace'
  );
  expect(getByText('Other Workspace').closest('a')).toHaveAttribute(
    'href',
    '/other-workspace'
  );
});

it('shows a separator if there are other workspaces', () => {
  const { getByRole, queryByRole, rerender } = render(
    <WorkspaceSwitcher {...props} otherWorkspaces={[]} />
  );
  expect(queryByRole('separator')).not.toBeInTheDocument();

  rerender(
    <WorkspaceSwitcher
      {...props}
      otherWorkspaces={[
        {
          id: '0',
          numberOfMembers: 2,
          name: 'Some Workspace',
          href: '/some-workspace',
        },
      ]}
    />
  );
  expect(getByRole('separator')).toBeVisible();
});
