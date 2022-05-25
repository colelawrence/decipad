import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { NotebookListItemActions } from './NotebookListItemActions';

const props: ComponentProps<typeof NotebookListItemActions> = {
  href: '',
  exportFileName: '',
  exportHref: '',
};

it('renders a list of 4 actions', () => {
  render(<NotebookListItemActions {...props} />);
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
});

it('links to the notebook', () => {
  render(<NotebookListItemActions {...props} href="/notebook" />);
  expect(screen.getByText(/open/i)).toHaveAttribute('href', '/notebook');
});

it('links to an export download', () => {
  render(
    <NotebookListItemActions
      {...props}
      exportFileName="export.json"
      exportHref="/exporthref"
    />
  );
  expect(screen.getByText(/export/i)).toHaveAttribute('href', '/exporthref');
  expect(screen.getByText(/export/i)).toHaveAttribute(
    'download',
    'export.json'
  );
});

it('can duplicate an notebook', async () => {
  const handleDuplicate = jest.fn();
  render(<NotebookListItemActions {...props} onDuplicate={handleDuplicate} />);

  await userEvent.click(screen.getByText(/dup/i));
  expect(handleDuplicate).toHaveBeenCalled();
});

it('can delete an notebook', async () => {
  const handleDelete = jest.fn();
  render(<NotebookListItemActions {...props} onDelete={handleDelete} />);

  await userEvent.click(screen.getByText(/del|rem/i, { selector: 'button' }));
  expect(handleDelete).toHaveBeenCalled();
});
