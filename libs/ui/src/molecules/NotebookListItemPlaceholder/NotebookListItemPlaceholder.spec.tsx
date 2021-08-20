import { render } from '@testing-library/react';
import { NotebookListItemPlaceholder } from './NotebookListItemPlaceholder';

it('renders placeholders', () => {
  const { getAllByRole } = render(<NotebookListItemPlaceholder />);
  expect(getAllByRole('presentation').length).toBeGreaterThan(1);
});
