import { render, screen } from '@testing-library/react';
import { Italic } from './Italic';

it('renders a italic icon', () => {
  render(<Italic />);
  expect(screen.getByTitle(/italic/i)).toBeInTheDocument();
});
