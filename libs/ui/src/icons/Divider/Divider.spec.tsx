import { render } from '@testing-library/react';
import { Divider } from './Divider';

it('renders a delete icon', () => {
  const { getByTitle } = render(<Divider />);
  expect(getByTitle(/divider/i)).toBeInTheDocument();
});
