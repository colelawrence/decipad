import { render, screen } from '@testing-library/react';
import { Disk } from './Disk';

it('renders a disk icon', () => {
  render(<Disk />);
  expect(screen.getByTitle(/disk/i)).toBeInTheDocument();
});
