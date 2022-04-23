import { render } from '@testing-library/react';
import { Refresh } from './Refresh';

it('renders a refresh icon', () => {
  const { getByTitle } = render(<Refresh />);
  expect(getByTitle(/refresh/i)).toBeInTheDocument();
});
