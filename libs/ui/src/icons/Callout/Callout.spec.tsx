import { render, screen } from '@testing-library/react';
import { Callout } from './Callout';

it('renders a callout icon', () => {
  render(<Callout />);
  expect(screen.getByTitle(/callout/i)).toBeInTheDocument();
});
