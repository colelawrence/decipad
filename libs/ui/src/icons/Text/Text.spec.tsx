import { render, screen } from '@testing-library/react';
import { Text } from './Text';

it('renders a text icon', () => {
  render(<Text />);
  expect(screen.getByTitle(/text/i)).toBeInTheDocument();
});
