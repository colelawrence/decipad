import { render, screen } from '@testing-library/react';
import { Info } from './Info';

it('renders a italic icon', () => {
  render(<Info />);
  expect(screen.getByTitle(/info/i)).toBeInTheDocument();
});
