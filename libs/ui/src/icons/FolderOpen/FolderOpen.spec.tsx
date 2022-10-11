import { render, screen } from '@testing-library/react';
import { FolderOpen } from './FolderOpen';

it('renders a folder open icon', () => {
  render(<FolderOpen />);
  expect(screen.getByTitle(/folder open/i)).toBeInTheDocument();
});
