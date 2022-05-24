import { render, screen } from '@testing-library/react';
import { Docs } from './Docs';

it('renders a docs icon', () => {
  render(<Docs />);
  expect(screen.getByTitle(/docs/i)).toBeInTheDocument();
});
