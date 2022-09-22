import { render, screen } from '@testing-library/react';
import { Result } from './Result';

it('renders a result icon', () => {
  render(<Result />);
  expect(screen.getByTitle(/result/i)).toBeInTheDocument();
});
