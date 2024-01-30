/* eslint-disable jest/no-disabled-tests */
import { render, screen } from '@testing-library/react';
import { NotebookListHeader } from './NotebookListHeader';

it('renders a heading at given level', () => {
  render(<NotebookListHeader Heading="h1" />);
  expect(screen.getByRole('heading').tagName).toBe('H1');
});

it.skip.each([
  [0, 'results'],
  [1, 'result'],
  [2, 'results'],
])('shows that there is/are %i notebook(s)', (numberOfNotebooks) => {
  const { container } = render(
    <NotebookListHeader Heading="h1" numberOfNotebooks={numberOfNotebooks} />
  );
  expect(container).toHaveTextContent(`Notebooks${numberOfNotebooks}`);
});
it('can be rendered without a result count', () => {
  const { container } = render(<NotebookListHeader Heading="h1" />);
  expect(container).not.toHaveTextContent(/result/i);
  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
});
