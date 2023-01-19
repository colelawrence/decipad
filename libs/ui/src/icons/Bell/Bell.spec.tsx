import { render, screen } from '@testing-library/react';
import { Bell } from './Bell';

it('renders a bell icon', () => {
  render(<Bell />);
  expect(screen.getByTitle(/bell/i)).toBeInTheDocument();
});
