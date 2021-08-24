import { render } from '@testing-library/react';
import { Bold } from './Bold';

it('renders a bold icon', () => {
  const { getByTitle } = render(<Bold />);
  expect(getByTitle(/bold/i)).toBeInTheDocument();
});
