/* eslint-disable jest/no-disabled-tests */
import { render } from '@testing-library/react';
import { ComponentProps } from 'react';

import { WorkspaceLogo } from './WorkspaceLogo';

const props: ComponentProps<typeof WorkspaceLogo> = {
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
    <WorkspaceLogo
      {...props}
      activeWorkspace={{ ...props.activeWorkspace, name: 'My WS' }}
    />
  );
  expect(getByText('My WS')).toBeVisible();
});
