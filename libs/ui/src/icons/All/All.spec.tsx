import { render, screen } from '@testing-library/react';
import { All } from './All';

it('renders an "all" icon', () => {
  render(<All />);
  expect(screen.getByTitle(/all/i)).toBeInTheDocument();
});
