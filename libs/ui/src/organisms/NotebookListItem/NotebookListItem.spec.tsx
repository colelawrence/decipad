import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { NotebookListItem } from './NotebookListItem';

const props: ComponentProps<typeof NotebookListItem> = {
  id: 'my-notebook',
  name: 'My Notebook',
  icon: 'Rocket',
  status: 'draft',
  iconColor: 'Catskill',
};

it('links to the notebook with its name', () => {
  const { getByText } = render(
    <NotebookListItem {...props} name="My Notebook" id="my-notebook" />
  );
  expect(getByText('My Notebook').closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('my-notebook')
  );
});

it('renders a placeholder for an empty name', () => {
  const { getByText } = render(<NotebookListItem {...props} name="" />);
  expect(getByText(/my note(book|pad)/i)).toBeVisible();
});

it('renders the default icon', () => {
  const { getByTitle } = render(<NotebookListItem {...props} />);
  expect(getByTitle(/rocket/i)).toBeInTheDocument();
});
