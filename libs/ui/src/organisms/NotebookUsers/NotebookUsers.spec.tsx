import { render } from '@testing-library/react';
import { NotebookUsers } from './NotebookUsers';

describe('Pad Avatar', () => {
  it('renders the users names', () => {
    const { getByText } = render(
      <NotebookUsers
        visible
        users={[
          {
            user: { name: 'John Doe', id: '1' },
            permission: 'ADMIN',
          },
          {
            user: { name: 'Doe John', id: '2' },
            permission: 'READ',
          },
        ]}
      />
    );

    expect(getByText(/john doe/i)).toBeVisible();
    expect(getByText(/doe john/i)).toBeVisible();
  });

  it('renders the users permissions', () => {
    const { getByText } = render(
      <NotebookUsers
        visible
        users={[
          {
            user: { name: 'John Doe', id: '1' },
            permission: 'ADMIN',
          },
          {
            user: { name: 'Doe John', id: '2' },
            permission: 'READ',
          },
        ]}
      />
    );

    expect(getByText(/admin/i)).toBeVisible();
    expect(getByText(/read/i)).toBeVisible();
  });
});
