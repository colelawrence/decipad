import { render, screen } from '@testing-library/react';
import { Discord } from './Discord';

it('renders a discord icon', () => {
  render(<Discord />);
  expect(screen.getByTitle(/discord/i)).toBeInTheDocument();
});
