import { render, screen } from '@testing-library/react';
import { Bolt } from './Bolt';

it('renders a bolt icon', () => {
  render(<Bolt />);
  expect(screen.getByTitle(/bolt/i)).toBeInTheDocument();
});
