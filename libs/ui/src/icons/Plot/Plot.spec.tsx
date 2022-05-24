import { render, screen } from '@testing-library/react';
import { Plot } from './Plot';

it('renders a plot icon', () => {
  render(<Plot />);
  expect(screen.getByTitle(/plot/i)).toBeInTheDocument();
});
