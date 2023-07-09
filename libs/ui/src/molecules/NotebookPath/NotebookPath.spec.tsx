import { render, screen } from '@testing-library/react';
import { NotebookPath } from '..';

describe('Notebook Path', () => {
  it("doesn't link to a workspace when shared", () => {
    render(<NotebookPath notebookName="Use of funds" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the workspace name', () => {
    render(<NotebookPath workspaceName="dogs" notebookName="Use of funds" />);

    expect(screen.getByText(/dogs/i)).toBeVisible();
  });
});
