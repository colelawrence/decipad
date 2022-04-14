import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { NotebookListItemActions } from './NotebookListItemActions';

const props: ComponentProps<typeof NotebookListItemActions> = {
  href: '',
  exportFileName: '',
  exportHref: '',
};

it('renders a list of 4 actions', () => {
  const { getAllByRole } = render(<NotebookListItemActions {...props} />);
  expect(getAllByRole('listitem')).toHaveLength(4);
});

it('links to the notebook', () => {
  const { getByText } = render(
    <NotebookListItemActions {...props} href="/notebook" />
  );
  expect(getByText(/open/i)).toHaveAttribute('href', '/notebook');
});

it('links to an export download', () => {
  const { getByText } = render(
    <NotebookListItemActions
      {...props}
      exportFileName="export.json"
      exportHref="/exporthref"
    />
  );
  expect(getByText(/export/i)).toHaveAttribute('href', '/exporthref');
  expect(getByText(/export/i)).toHaveAttribute('download', 'export.json');
});

it('can duplicate an notebook', async () => {
  const handleDuplicate = jest.fn();
  const { getByText } = render(
    <NotebookListItemActions {...props} onDuplicate={handleDuplicate} />
  );

  await userEvent.click(getByText(/dup/i));
  expect(handleDuplicate).toHaveBeenCalled();
});

it('can delete an notebook', async () => {
  const handleDelete = jest.fn();
  const { getByText } = render(
    <NotebookListItemActions {...props} onDelete={handleDelete} />
  );

  await userEvent.click(getByText(/del|rem/i, { selector: 'button' }));
  expect(handleDelete).toHaveBeenCalled();
});
