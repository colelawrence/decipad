import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableDropLine } from './TableDropLine';

it('renders a presentational element', () => {
  render(<TableDropLine variant="row" />);
  expect(screen.getByLabelText(/drop/i)).toBeVisible();
});
