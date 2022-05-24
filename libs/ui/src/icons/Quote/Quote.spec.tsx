import { render, screen } from '@testing-library/react';
import { Quote } from './Quote';

it('renders a quote icon', () => {
  render(<Quote />);
  expect(screen.getByTitle(/quote/i)).toBeInTheDocument();
});
