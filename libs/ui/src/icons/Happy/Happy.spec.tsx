import { render } from '@testing-library/react';
import { Happy } from './Happy';

it('renders a happy icon', () => {
  const { getByTitle } = render(<Happy />);
  expect(getByTitle(/happy/i)).toBeInTheDocument();
});
