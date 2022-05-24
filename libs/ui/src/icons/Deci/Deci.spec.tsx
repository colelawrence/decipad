import { render, screen } from '@testing-library/react';
import { Deci } from './Deci';

it('renders a deci icon', () => {
  render(<Deci />);
  expect(screen.getByTitle(/decipad logo/i)).toBeInTheDocument();
});
