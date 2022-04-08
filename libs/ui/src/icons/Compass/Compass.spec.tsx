import { render } from '@testing-library/react';
import { Compass } from './Compass';

it('renders a compass icon', () => {
  const { getByTitle } = render(<Compass />);
  expect(getByTitle(/compass/i)).toBeInTheDocument();
});
