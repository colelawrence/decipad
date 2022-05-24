import { render, screen } from '@testing-library/react';
import { CheckboxUnselected } from './CheckboxUnselected';

it('renders a checkbox unselected icon', () => {
  render(<CheckboxUnselected />);
  expect(screen.getByTitle(/unselected/i)).toBeInTheDocument();
});
