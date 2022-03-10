import { mockConsoleError } from '@decipad/testutils';
import { render } from '@testing-library/react';
import { Provider } from 'next-auth/client';
import { ComponentProps } from 'react';
import { NotebookTopbar } from './NotebookTopbar';

const props: ComponentProps<typeof NotebookTopbar> = {
  workspaceHref: '/workspaces/johndoespad',
  workspaceName: "John's Workspace",
  notebookName: 'My first notebook',
  permission: 'ADMIN',
  usersWithAccess: [
    {
      user: { id: '1', name: 'John Doe' },
      permission: 'ADMIN',
    },
  ],
  link: '',
};

describe('Notebook Topbar', () => {
  mockConsoleError();

  it('renders the try decipad button only for non authenticated users', () => {
    const { getByText, queryByText, rerender } = render(
      <Provider session={{ user: {} }}>
        <NotebookTopbar {...props} permission="READ" />
      </Provider>
    );
    expect(queryByText(/try decipad/i)).not.toBeInTheDocument();

    rerender(<NotebookTopbar {...props} permission="READ" />);
    expect(getByText(/try decipad/i)).toHaveAttribute(
      'href',
      expect.stringMatching(/typeform/i)
    );
  });

  it('renders the duplicate button only when not admin', () => {
    const { getByText, queryByText, rerender } = render(
      <Provider session={{ user: {} }}>
        <NotebookTopbar {...props} permission="ADMIN" />
      </Provider>
    );
    expect(queryByText(/dup/i)).not.toBeInTheDocument();

    rerender(
      <Provider session={{ user: {} }}>
        <NotebookTopbar {...props} permission="READ" />
      </Provider>
    );
    expect(getByText(/dup/i)).toBeVisible();
  });

  it('renders the share button only when admin', () => {
    const { getByText, queryByText, rerender } = render(
      <Provider session={{ user: {} }}>
        <NotebookTopbar {...props} permission="WRITE" />
      </Provider>
    );
    expect(queryByText(/share/i)).not.toBeInTheDocument();

    rerender(
      <Provider session={{ user: {} }}>
        <NotebookTopbar {...props} permission="ADMIN" />
      </Provider>
    );
    expect(getByText(/share/i)).toBeVisible();
  });

  it("doesn't render the need help button when shared", () => {
    const { getByText, rerender, queryByText } = render(
      <NotebookTopbar {...props} permission="ADMIN" />
    );

    expect(getByText(/need help/i)).toBeInTheDocument();

    rerender(<NotebookTopbar {...props} permission="READ" />);

    expect(queryByText(/need help/i)).not.toBeInTheDocument();
  });
});
