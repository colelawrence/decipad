import { render } from '@testing-library/react';
import { All } from './All';

it('renders an "all" icon', () => {
  const { getByTitle } = render(<All />);
  expect(getByTitle(/all/i)).toBeInTheDocument();
});
