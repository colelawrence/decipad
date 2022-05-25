import { render, screen } from '@testing-library/react';
import { NotebookListItemPlaceholder } from './NotebookListItemPlaceholder';

it('renders placeholders', () => {
  render(<NotebookListItemPlaceholder />);
  expect(screen.getAllByRole('presentation').length).toBeGreaterThan(1);
});
