import { render } from '@testing-library/react';
import { Trophy } from './Trophy';

it('renders a trophy icon', () => {
  const { getByTitle } = render(<Trophy />);
  expect(getByTitle(/trophy/i)).toBeInTheDocument();
});
