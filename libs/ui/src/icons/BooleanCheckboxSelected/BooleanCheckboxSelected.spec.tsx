import { render, screen } from '@testing-library/react';
import { BooleanCheckboxSelected } from './BooleanCheckboxSelected';

it('renders a boolean checkbox selected icon', () => {
  render(<BooleanCheckboxSelected />);
  expect(screen.getByTitle(/selected/i)).toBeInTheDocument();
});
