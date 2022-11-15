import { render, screen } from '@testing-library/react';
import { BooleanCheckboxUnselected } from './BooleanCheckboxUnselected';

it('renders a boolean checkbox unselected icon', () => {
  render(<BooleanCheckboxUnselected />);
  expect(screen.getByTitle(/unselected/i)).toBeInTheDocument();
});
