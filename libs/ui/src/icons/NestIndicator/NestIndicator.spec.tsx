import { render, screen } from '@testing-library/react';
import { NestIndicator } from './NestIndicator';

it('renders a nest indicator icon', () => {
  render(<NestIndicator />);
  expect(screen.getByTitle(/nest/i)).toBeInTheDocument();
});
