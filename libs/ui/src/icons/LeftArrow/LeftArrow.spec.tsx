import { render, screen } from '@testing-library/react';
import { LeftArrow } from './LeftArrow';

it('renders a left arrow icon', () => {
  render(<LeftArrow />);
  expect(screen.getByTitle(/left arrow/i)).toBeInTheDocument();
});
