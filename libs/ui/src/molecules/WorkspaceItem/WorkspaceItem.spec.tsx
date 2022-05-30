import { render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { WorkspaceItem } from './WorkspaceItem';

const props: ComponentProps<typeof WorkspaceItem> = {
  id: '42',
  name: 'Some Workspace',
  numberOfMembers: 2,
};

it('shows the workspace name', () => {
  render(<WorkspaceItem {...props} name="Some Workspace" />);
  expect(screen.getByText('Some Workspace')).toBeVisible();
});

it('renders an avatar with the initial of the workspace', () => {
  render(<WorkspaceItem {...props} name="Some Workspace" />);
  expect(screen.getByLabelText(/avatar/i)).toHaveTextContent(/^s$/i);
});

it.each([
  [0, 'members'],
  [1, 'member'],
  [2, 'members'],
])('shows that there is/are %i member(s)', (numberOfMembers, pluralization) => {
  render(<WorkspaceItem {...props} numberOfMembers={numberOfMembers} />);
  expect(screen.getByText(`${numberOfMembers} ${pluralization}`)).toBeVisible();
});
