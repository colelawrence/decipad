import { render, screen } from '@testing-library/react';
import { Settings } from './Settings';

it('renders a settings icon', () => {
  render(<Settings />);
  expect(screen.getByTitle(/settings/i)).toBeInTheDocument();
});
