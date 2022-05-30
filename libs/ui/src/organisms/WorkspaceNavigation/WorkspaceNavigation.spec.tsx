import { render } from '@testing-library/react';
import { WorkspaceNavigation } from './WorkspaceNavigation';

it('renders navigation links', () => {
  const { getAllByRole, getByText } = render(
    <WorkspaceNavigation activeWorkspace={{ id: '42' }} />
  );
  expect(getAllByRole('listitem')).toHaveLength(4);
  expect(getByText(/notebook/i).closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('42')
  );
  expect(getByText(/discord/i).closest('a')).toHaveAttribute('href');
  expect(getByText(/preference/i).closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('42')
  );
});
