import { render, screen } from '@testing-library/react';
import { DropLine } from './DropLine';

it('renders a presentational element', () => {
  render(<DropLine />);
  expect(screen.getByLabelText(/drop/i)).toBeVisible();
});
