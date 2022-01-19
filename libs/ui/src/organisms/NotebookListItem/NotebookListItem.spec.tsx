import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { NotebookListItem } from './NotebookListItem';

const props: ComponentProps<typeof NotebookListItem> = {
  name: 'My Notebook',
  href: '/my-notebook',
  exportFileName: '',
  exportHref: '',
};

it('links to the notebook with its name', () => {
  const { getByText } = render(
    <NotebookListItem {...props} name="My Notebook" href="/my-notebook" />
  );
  expect(getByText('My Notebook').closest('a')).toHaveAttribute(
    'href',
    '/my-notebook'
  );
});

it('renders a placeholder for an empty name', () => {
  const { getByText } = render(
    <NotebookListItem {...props} name="" href="/my-notebook" />
  );
  expect(getByText(/my note(book|pad)/i)).toBeVisible();
});
