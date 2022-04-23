import { render } from '@testing-library/react';
import { World } from './World';

it('renders a world icon', () => {
  const { getByTitle } = render(<World />);
  expect(getByTitle(/world/i)).toBeInTheDocument();
});
