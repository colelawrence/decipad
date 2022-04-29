import { render } from '@testing-library/react';
import { CheckboxSelected } from './CheckboxSelected';

it('renders a checkbox selected icon', () => {
  const { getByTitle } = render(<CheckboxSelected />);
  expect(getByTitle(/selected/i)).toBeInTheDocument();
});
