import { render } from '@testing-library/react';
import { Cloud } from './Cloud';

it('renders a cloud icon', () => {
  const { getByTitle } = render(<Cloud />);
  expect(getByTitle(/cloud/i)).toBeInTheDocument();
});
