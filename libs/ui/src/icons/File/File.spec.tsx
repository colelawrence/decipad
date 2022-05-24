import { render, screen } from '@testing-library/react';
import { File } from './File';

it('renders a file icon', () => {
  render(<File />);
  expect(screen.getByTitle(/file/i)).toBeInTheDocument();
});
