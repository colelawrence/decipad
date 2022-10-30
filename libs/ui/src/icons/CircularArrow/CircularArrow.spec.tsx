import { render, screen } from '@testing-library/react';
import { CircularArrow } from './CircularArrow';

it('renders a close icon', () => {
  render(<CircularArrow active={true} />);
  expect(screen.getByTitle(/circular arrow/i)).toBeInTheDocument();
});
