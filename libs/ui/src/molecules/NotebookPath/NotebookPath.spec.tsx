import { render, screen } from '@testing-library/react';
import { NotebookPath } from '..';

describe('Notebook Path', () => {
  it("doesn't link to a workspace when shared", () => {
    render(<NotebookPath notebookName="Use of funds" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders notebook name', () => {
    render(<NotebookPath notebookName="Use of funds" />);

    expect(screen.getByText('Use of funds')).toBeInTheDocument();
  });

  it('renders truncated notebook name', () => {
    render(<NotebookPath notebookName="this is a notebook name" />);

    expect(screen.getByText('this is a notebook n...')).toBeInTheDocument();
  });
});
