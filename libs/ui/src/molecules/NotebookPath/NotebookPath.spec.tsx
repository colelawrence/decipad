import { render } from '@testing-library/react';
import { NotebookPath } from '..';

describe('Notebook Path', () => {
  it("doesn't link to a workspace when shared", () => {
    const { queryByRole } = render(
      <NotebookPath notebookName="Use of funds" />
    );

    expect(queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the notebook name', () => {
    const { getByText } = render(<NotebookPath notebookName="Use of funds" />);

    expect(getByText(/use of funds/i)).toBeVisible();
  });
});
