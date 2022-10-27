import { render, screen } from '@testing-library/react';
import { CircularArrow } from './CircularArrow';

it('renders a close icon', () => {
  render(<CircularArrow />);
  expect(screen.getByTitle(/circular arrow/i)).toBeInTheDocument();
});
