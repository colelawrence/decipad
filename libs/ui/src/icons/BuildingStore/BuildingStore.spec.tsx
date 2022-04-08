import { render } from '@testing-library/react';
import { BuildingStore } from './BuildingStore';

it('renders a building store icon', () => {
  const { getByTitle } = render(<BuildingStore />);
  expect(getByTitle(/building store/i)).toBeInTheDocument();
});
