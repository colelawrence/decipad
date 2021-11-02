import { render } from '@testing-library/react';
import { Placeholder } from './Placeholder';

it('renders a placeholder icon', () => {
  const { getByTitle } = render(<Placeholder />);
  expect(getByTitle(/placeholder/i)).toBeInTheDocument();
});
