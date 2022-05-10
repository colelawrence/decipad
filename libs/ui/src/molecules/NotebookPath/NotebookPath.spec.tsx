import { render } from '@testing-library/react';
import { NotebookPath } from '..';

describe('Notebook Path', () => {
  it('links to the workspace', () => {
    const { getByText } = render(
      <NotebookPath
        isWriter
        workspace={{ id: 'wsid', name: 'John' }}
        notebookName="Use of funds"
      />
    );

    expect(getByText('John').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('wsid')
    );
  });

  it("doesn't link to a workspace when shared", () => {
    const { queryByRole } = render(
      <NotebookPath
        isWriter={false}
        workspace={{ id: 'wsid', name: 'John' }}
        notebookName="Use of funds"
      />
    );

    expect(queryByRole('link')).not.toBeInTheDocument();
  });

  it("doesn't render the workspace name when shared", () => {
    const { queryByText, queryByRole } = render(
      <NotebookPath
        isWriter={false}
        workspace={{ id: 'wsid', name: 'John' }}
        notebookName="Use of funds"
      />
    );

    expect(queryByRole('link')).not.toBeInTheDocument();
    expect(queryByText('John')).not.toBeInTheDocument();
  });

  it('renders the notebook name', () => {
    const { getByText } = render(
      <NotebookPath
        isWriter
        workspace={{ id: 'wsid', name: 'John' }}
        notebookName="Use of funds"
      />
    );

    expect(getByText(/use of funds/i)).toBeVisible();
  });
});
