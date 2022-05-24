import { render, screen } from '@testing-library/react';
import { Heading1 } from './Heading1';

it('renders a heading icon', () => {
  render(<Heading1 />);
  expect(screen.getByTitle(/heading1/i)).toBeInTheDocument();
});
