import { render } from '@testing-library/react';
import { NotebookPath } from '..';

describe('Pad Path', () => {
  it('links to the workspace', () => {
    const { getByText } = render(
      <NotebookPath
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

  it('renders the pad name', () => {
    const { getByText } = render(
      <NotebookPath
        workspaceName="John's Workspace"
        notebookName="Use of funds"
        workspaceHref=""
      />
    );

    expect(getByText(/use of funds/i)).toBeVisible();
  });
});
