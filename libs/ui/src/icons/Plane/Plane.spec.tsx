import { render } from '@testing-library/react';
import { Plane } from './Plane';

it('renders a plane icon', () => {
  const { getByTitle } = render(<Plane />);
  expect(getByTitle(/plane/i)).toBeInTheDocument();
});
