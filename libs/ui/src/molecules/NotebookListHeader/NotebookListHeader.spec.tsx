import { render } from '@testing-library/react';
import { NotebookListHeader } from './NotebookListHeader';

it('renders a heading at given level', () => {
  const { getByRole } = render(<NotebookListHeader Heading="h1" />);
  expect(getByRole('heading').tagName).toBe('H1');
});

it.each([
  [0, 'results'],
  [1, 'result'],
  [2, 'results'],
])('shows that there are %i notebooks', (numberOfNotebooks, pluralization) => {
  const { container } = render(
    <NotebookListHeader Heading="h1" numberOfNotebooks={numberOfNotebooks} />
  );
  expect(container).toHaveTextContent(`${numberOfNotebooks} ${pluralization}`);
});
it('can be rendered without a result count', () => {
  const { container } = render(<NotebookListHeader Heading="h1" />);
  expect(container).not.toHaveTextContent(/result/i);
});
