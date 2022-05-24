import { render, screen } from '@testing-library/react';
import { Calculations } from './Calculations';

it('renders a calculations icon', () => {
  render(<Calculations />);
  expect(screen.getByTitle(/slashcommandcal/i)).toBeInTheDocument();
});
