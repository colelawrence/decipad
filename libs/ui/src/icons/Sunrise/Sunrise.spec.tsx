import { render } from '@testing-library/react';
import { Sunrise } from './Sunrise';

it('renders a sunrise icon', () => {
  const { getByTitle } = render(<Sunrise />);
  expect(getByTitle(/sunrise/i)).toBeInTheDocument();
});
