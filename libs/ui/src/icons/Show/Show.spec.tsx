import { render } from '@testing-library/react';
import { Show } from './Show';

it('renders a show icon', () => {
  const { getByTitle } = render(<Show />);
  expect(getByTitle(/show/i)).toBeInTheDocument();
});
