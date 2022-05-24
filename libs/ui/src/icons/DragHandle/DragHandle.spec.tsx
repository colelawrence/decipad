import { render, screen } from '@testing-library/react';
import { DragHandle } from './DragHandle';

it('renders a drag handle', () => {
  render(<DragHandle />);
  expect(screen.getByTitle(/drag/i)).toBeInTheDocument();
});
