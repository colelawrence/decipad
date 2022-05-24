import { render, screen } from '@testing-library/react';
import { Cloud } from './Cloud';

it('renders a cloud icon', () => {
  render(<Cloud />);
  expect(screen.getByTitle(/cloud/i)).toBeInTheDocument();
});
