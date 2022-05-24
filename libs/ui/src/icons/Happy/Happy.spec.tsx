import { render, screen } from '@testing-library/react';
import { Happy } from './Happy';

it('renders a happy icon', () => {
  render(<Happy />);
  expect(screen.getByTitle(/happy/i)).toBeInTheDocument();
});
