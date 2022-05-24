import { render, screen } from '@testing-library/react';
import { Compass } from './Compass';

it('renders a compass icon', () => {
  render(<Compass />);
  expect(screen.getByTitle(/compass/i)).toBeInTheDocument();
});
