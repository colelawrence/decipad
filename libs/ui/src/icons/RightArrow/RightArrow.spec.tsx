import { render, screen } from '@testing-library/react';
import { RightArrow } from './RightArrow';

it('renders a right arrow icon', () => {
  render(<RightArrow />);
  expect(screen.getByTitle(/right arrow/i)).toBeInTheDocument();
});
