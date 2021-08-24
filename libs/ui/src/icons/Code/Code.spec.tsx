import { render } from '@testing-library/react';
import { Code } from './Code';

it('renders a code icon', () => {
  const { getByTitle } = render(<Code />);
  expect(getByTitle(/code/i)).toBeInTheDocument();
});
