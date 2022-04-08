import { render } from '@testing-library/react';
import { Announcement } from './Announcement';

it('renders an "announcement" icon', () => {
  const { getByTitle } = render(<Announcement />);
  expect(getByTitle(/announcement/i)).toBeInTheDocument();
});
