import { render } from '@testing-library/react';
import { Bullet } from './Bullet';

it('renders a bullet icon', () => {
  const { getByTitle } = render(<Bullet />);
  expect(getByTitle(/bullet/i)).toBeInTheDocument();
});
