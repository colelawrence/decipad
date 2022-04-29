import { render } from '@testing-library/react';
import { CheckboxUnselected } from './CheckboxUnselected';

it('renders a checkbox unselected icon', () => {
  const { getByTitle } = render(<CheckboxUnselected />);
  expect(getByTitle(/unselected/i)).toBeInTheDocument();
});
