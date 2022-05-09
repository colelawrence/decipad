import { render } from '@testing-library/react';
import { Hide } from './Hide';

it('renders a hide icon', () => {
  const { getByTitle } = render(<Hide />);
  expect(getByTitle(/hide/i)).toBeInTheDocument();
});
