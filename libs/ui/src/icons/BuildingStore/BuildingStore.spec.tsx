import { render, screen } from '@testing-library/react';
import { BuildingStore } from './BuildingStore';

it('renders a building store icon', () => {
  render(<BuildingStore />);
  expect(screen.getByTitle(/building store/i)).toBeInTheDocument();
});
