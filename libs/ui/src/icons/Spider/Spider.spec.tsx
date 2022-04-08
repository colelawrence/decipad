import { render } from '@testing-library/react';
import { Spider } from './Spider';

it('renders a spider icon', () => {
  const { getByTitle } = render(<Spider />);
  expect(getByTitle(/spider/i)).toBeInTheDocument();
});
