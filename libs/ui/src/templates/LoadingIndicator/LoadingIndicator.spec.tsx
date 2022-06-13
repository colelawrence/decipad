import { render } from '@testing-library/react';
import { LoadingIndicator } from './LoadingIndicator';

it('renders a loading indicator', () => {
  const { getByTitle } = render(<LoadingIndicator />);
  expect(getByTitle(/loading/i)).toBeInTheDocument();
});
