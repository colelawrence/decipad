import { render, screen } from '@testing-library/react';
import { Folder } from './Folder';

it('renders a folder icon', () => {
  render(<Folder />);
  expect(screen.getByTitle(/folder/i)).toBeInTheDocument();
});
