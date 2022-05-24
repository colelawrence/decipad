import { render, screen } from '@testing-library/react';
import { CheckboxSelected } from './CheckboxSelected';

it('renders a checkbox selected icon', () => {
  render(<CheckboxSelected />);
  expect(screen.getByTitle(/selected/i)).toBeInTheDocument();
});
