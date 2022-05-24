import { render, screen } from '@testing-library/react';
import { Placeholder } from './Placeholder';

it('renders a placeholder icon', () => {
  render(<Placeholder />);
  expect(screen.getByTitle(/placeholder/i)).toBeInTheDocument();
});
