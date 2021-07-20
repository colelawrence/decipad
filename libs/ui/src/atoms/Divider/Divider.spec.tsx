import { render } from '@testing-library/react';
import { Divider } from './Divider';

it('renders a separator', () => {
  const { getByRole } = render(<Divider />);
  expect(getByRole('separator')).toBeVisible();
});
