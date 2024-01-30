import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

it('renders a separator', () => {
  render(<Divider />);
  expect(screen.getByRole('separator')).toBeVisible();
});
