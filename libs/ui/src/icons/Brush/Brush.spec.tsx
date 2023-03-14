import { render, screen } from '@testing-library/react';
import { Brush } from './Brush';

it('renders a bolt icon', () => {
  render(<Brush />);
  expect(screen.getByTitle(/Brush/i)).toBeInTheDocument();
});
