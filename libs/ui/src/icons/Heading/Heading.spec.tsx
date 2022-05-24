import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';

it('renders a heading icon', () => {
  render(<Heading />);
  expect(screen.getByTitle(/heading/i)).toBeInTheDocument();
});
