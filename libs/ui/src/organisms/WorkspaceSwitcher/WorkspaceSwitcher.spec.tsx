import { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkspaceSwitcher } from './WorkspaceSwitcher';

const props: ComponentProps<typeof WorkspaceSwitcher> = {
  Heading: 'h1',
  activeWorkspace: {
    id: '42',
    name: 'Active Workspace',
    numberOfMembers: 2,
  },
  otherWorkspaces: [],
};

it('shows the active workspace name', () => {
  const { getByText } = render(
    <WorkspaceSwitcher
      {...props}
      activeWorkspace={{ ...props.activeWorkspace, name: 'My WS' }}
    />
  );
  expect(getByText('My WS')).toBeVisible();
});

it('opens and closes a workspace menu', async () => {
  const { getByText, queryByText, getByTitle } = render(
    <WorkspaceSwitcher
      {...props}
      otherWorkspaces={[{ name: 'Other WS', id: '0', numberOfMembers: 1 }]}
    />
  );

  await userEvent.click(getByTitle(/expand/i));
  expect(getByText('Other WS')).toBeVisible();

  await userEvent.click(getByTitle(/collapse/i));
  expect(queryByText('Other WS')).not.toBeInTheDocument();
});
