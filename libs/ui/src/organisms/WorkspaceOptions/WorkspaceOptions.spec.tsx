import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';

import { WorkspaceOptions } from './WorkspaceOptions';

const props: ComponentProps<typeof WorkspaceOptions> = {
  Heading: 'h1',
  activeWorkspace: {
    id: '42',
    name: 'Active Workspace',
    numberOfMembers: 2,
  },
  allWorkspaces: [],
};

it('shows the active workspace name', () => {
  const { getByText } = render(
    <WorkspaceOptions
      {...props}
      activeWorkspace={{ ...props.activeWorkspace, name: 'My WS' }}
    />
  );
  expect(getByText('My WS')).toBeVisible();
});

it('opens and closes a workspace menu', async () => {
  const { getByText, queryByText, getByTitle } = render(
    <WorkspaceOptions
      {...props}
      allWorkspaces={[{ name: 'Other WS', id: '0', numberOfMembers: 1 }]}
    />
  );

  await userEvent.click(getByTitle(/expand/i));
  expect(getByText('Other WS')).toBeVisible();

  await userEvent.click(getByTitle(/collapse/i));
  expect(queryByText('Other WS')).not.toBeInTheDocument();
});
