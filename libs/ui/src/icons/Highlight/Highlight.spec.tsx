import { render, screen } from '@testing-library/react';
import { Highlight } from './Highlight';

it('renders a highlight icon', () => {
  render(<Highlight />);
  expect(screen.getByTitle(/highlight/i)).toBeInTheDocument();
});
