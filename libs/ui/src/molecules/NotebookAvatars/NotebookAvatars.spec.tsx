import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotebookAvatars, NotebookAvatarsProps } from './NotebookAvatars';
import { PermissionType } from '@decipad/graphql-client';

const props: NotebookAvatarsProps = {
  invitedUsers: [
    {
      user: {
        id: '0',
        name: 'John Doe',
        email: 'foo@nar.com',
      },
      permission: PermissionType.Write,
      canComment: true,
    },
    {
      user: {
        id: '1',
        name: 'Blake Doe',
        email: 'blake@nar.com',
      },
      permission: PermissionType.Read,
      canComment: true,
    },
    {
      user: {
        id: '2',
        name: 'Chris Doe',
        email: 'chris@nar.com',
      },
      permission: PermissionType.Admin,
      canComment: true,
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
    expect(await screen.findByText('author')).toBeInTheDocument();

    await userEvent.hover(screen.getByText('J'));

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(await screen.findByText('collaborator')).toBeInTheDocument();

    await userEvent.hover(screen.getByText('B'));

    expect(await screen.findByText('Blake Doe')).toBeInTheDocument();
    expect(await screen.findByText('reader')).toBeInTheDocument();
  });
});
