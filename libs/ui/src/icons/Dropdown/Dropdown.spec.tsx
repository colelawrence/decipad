import { render, screen } from '@testing-library/react';
import { Dropdown } from './Dropdown';

it('renders a result icon', () => {
  render(<Dropdown />);
  expect(screen.getByTitle(/dropdown/i)).toBeInTheDocument();
});
