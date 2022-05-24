import { render, screen } from '@testing-library/react';
import { Announcement } from './Announcement';

it('renders an "announcement" icon', () => {
  render(<Announcement />);
  expect(screen.getByTitle(/announcement/i)).toBeInTheDocument();
});
