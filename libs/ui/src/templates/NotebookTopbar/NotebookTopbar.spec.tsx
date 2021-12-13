import { render } from '@testing-library/react';
import { NotebookTopbar } from './NotebookTopbar';

describe('Notebook Topbar', () => {
  it("doesn't render the sharing button when not admin", () => {
    const { queryByText } = render(
      <NotebookTopbar
        workspaceHref="/workspaces/johndoespad"
        workspaceName="John's Workspace"
        notebookName="my first pad"
        usersWithAccess={[
          {
            user: { id: '1', name: 'john doe' },
            permission: 'ADMIN',
          },
        ]}
        permission="READ"
        link=""
      />
    );
    expect(queryByText(/share/i)).toBeNull();
  });

  it('renders the share button when admin', () => {
    const { getByText } = render(
      <NotebookTopbar
        workspaceHref="/workspaces/johndoespad"
        workspaceName="John's Workspace"
        notebookName="my first notebook"
        usersWithAccess={[
          {
            user: { id: '1', name: 'john doe' },
            permission: 'ADMIN',
          },
        ]}
        permission="ADMIN"
        link=""
      />
    );
    expect(getByText(/share/i)).toBeVisible();
  });
});
