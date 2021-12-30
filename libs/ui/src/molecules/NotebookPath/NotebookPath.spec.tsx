import { render } from '@testing-library/react';
import { NotebookPath } from '..';

describe('Notebook Path', () => {
  it('links to the workspace', () => {
    const { getByText } = render(
      <NotebookPath
        isAdmin
        workspaceName="John's Workspace"
        notebookName="Use of funds"
        workspaceHref="/workspace"
      />
    );

    expect(getByText(/john's workspace/i).closest('a')).toHaveAttribute(
      'href',
      '/workspace'
    );
  });

  it("doesn't link to a workspace when shared", () => {
    const { container } = render(
      <NotebookPath
        isAdmin={false}
        workspaceName="John's Workspace"
        notebookName="Use of funds"
        workspaceHref="/workspace"
      />
    );

    expect(container.querySelector('a')).not.toBeInTheDocument();
  });

  it('renders the notebook name', () => {
    const { getByText } = render(
      <NotebookPath
        isAdmin
        workspaceName="John's Workspace"
        notebookName="Use of funds"
        workspaceHref=""
      />
    );

    expect(getByText(/use of funds/i)).toBeVisible();
  });
});
