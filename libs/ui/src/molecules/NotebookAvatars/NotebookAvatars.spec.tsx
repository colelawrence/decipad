import { render, screen } from '@testing-library/react';
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
  isWriter: true,
};

describe('NotebookAvatars Molecule', () => {
  it("renders the users' initials", () => {
    const { container } = render(<NotebookAvatars {...props} />);

    expect(container).toHaveTextContent('J');
    expect(container).toHaveTextContent('B');
    expect(container).toHaveTextContent('C');
  });

  it("renders the users' names and role inside tooltip when in writer mode", async () => {
    render(<NotebookAvatars {...props} />);

    expect(screen.queryByText('Chris Doe')).toBeNull();

    await userEvent.hover(screen.getByText('C'));

    expect(await screen.findByText('Chris Doe')).toBeInTheDocument();
    expect(await screen.findByText('Owner')).toBeInTheDocument();

    await userEvent.hover(screen.getByText('J'));

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(await screen.findByText('Can Edit')).toBeInTheDocument();

    await userEvent.hover(screen.getByText('B'));

    expect(await screen.findByText('Blake Doe')).toBeInTheDocument();
    expect(await screen.findByText('View Only')).toBeInTheDocument();
  });
});
