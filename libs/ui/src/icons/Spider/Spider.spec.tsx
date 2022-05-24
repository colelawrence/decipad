import { render, screen } from '@testing-library/react';
import { Spider } from './Spider';

it('renders a spider icon', () => {
  render(<Spider />);
  expect(screen.getByTitle(/spider/i)).toBeInTheDocument();
});
