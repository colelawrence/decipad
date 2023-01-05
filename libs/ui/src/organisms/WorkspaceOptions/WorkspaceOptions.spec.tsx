import { render } from '@testing-library/react';
import { ComponentProps } from 'react';

import { WorkspaceOptions } from './WorkspaceOptions';

const props: ComponentProps<typeof WorkspaceOptions> = {
  Heading: 'h1',
  activeWorkspace: {
    id: '42',
    name: 'Active Workspace',
    sections: [],
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
