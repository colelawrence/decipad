import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotebookAvatars, NotebookAvatarsProps } from './NotebookAvatars';

const props: NotebookAvatarsProps = {
  usersWithAccess: [
    {
      user: {
        id: '0',
        name: 'John Doe',
      },
      permission: 'WRITE',
    },
    {
      user: {
        id: '1',
        name: 'Blake Doe',
      },
      permission: 'READ',
    },
    {
      user: {
        id: '2',
        name: 'Chris Doe',
      },
      permission: 'ADMIN',
    },
  ],
};

describe('NotebookAvatars Molecule', () => {
  it("renders the users' initials", () => {
    const { container } = render(<NotebookAvatars {...props} />);

    expect(container).toHaveTextContent('J');
    expect(container).toHaveTextContent('B');
    expect(container).toHaveTextContent('C');
  });

  it("renders the users' names and role inside tooltip", async () => {
    const { findByText, getByText, queryByText } = render(
      <NotebookAvatars {...props} />
    );

    expect(await queryByText('Chris Doe')).toBeNull();

    userEvent.hover(getByText('C'));

    expect(await findByText('Chris Doe')).toBeInTheDocument();
    expect(await findByText('Owner')).toBeInTheDocument();

    userEvent.hover(getByText('J'));

    expect(await findByText('John Doe')).toBeInTheDocument();
    expect(await findByText('Can Edit')).toBeInTheDocument();

    userEvent.hover(getByText('B'));

    expect(await findByText('Blake Doe')).toBeInTheDocument();
    expect(await findByText('View Only')).toBeInTheDocument();
  });
});
