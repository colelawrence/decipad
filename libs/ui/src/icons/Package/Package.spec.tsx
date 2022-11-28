import { render, screen } from '@testing-library/react';
import { Package } from './Package';

it('renders a package icon', () => {
  render(<Package />);
  expect(screen.getByTitle(/package/i)).toBeInTheDocument();
});
