import { render, screen } from '@testing-library/react';
import { Success } from './Success';

it('renders a success icon', () => {
  render(<Success />);
  expect(screen.getByTitle(/success/i)).toBeInTheDocument();
});
