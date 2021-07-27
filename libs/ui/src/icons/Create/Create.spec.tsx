import { render } from '@testing-library/react';
import { Create } from './Create';

it('renders a create icon', () => {
  const { getByTitle } = render(<Create />);
  expect(getByTitle(/create/i)).toBeInTheDocument();
});
