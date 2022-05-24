import { render, screen } from '@testing-library/react';
import { Heading2 } from './Heading2';

it('renders a heading icon', () => {
  render(<Heading2 />);
  expect(screen.getByTitle(/heading2/i)).toBeInTheDocument();
});
