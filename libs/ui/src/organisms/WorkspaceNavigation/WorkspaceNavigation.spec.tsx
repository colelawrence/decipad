import { render } from '@testing-library/react';
import { WorkspaceNavigation } from './WorkspaceNavigation';

it('renders navigation links', () => {
  const { getAllByRole, getByText } = render(
    <WorkspaceNavigation
      allNotebooksHref="/all-notebooks"
      preferencesHref="/preferences"
    />
  );
  expect(getAllByRole('listitem')).toHaveLength(3);
  expect(getByText(/notebook/i).closest('a')).toHaveAttribute(
    'href',
    '/all-notebooks'
  );
  expect(getByText(/community/i).closest('a')).toHaveAttribute('href');
  expect(getByText(/preference/i).closest('a')).toHaveAttribute(
    'href',
    '/preferences'
  );
});
