import { render } from '@testing-library/react';
import { Disk } from './Disk';

it('renders a disk icon', () => {
  const { getByTitle } = render(<Disk />);
  expect(getByTitle(/disk/i)).toBeInTheDocument();
});
