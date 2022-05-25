import { render, screen } from '@testing-library/react';
import { DividerBlock } from './DividerBlock';

it('renders a separator', () => {
  render(<DividerBlock />);
  expect(screen.getByRole('separator')).toBeVisible();
});
