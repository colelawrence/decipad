import { render } from '@testing-library/react';
import { DividerBlock } from './DividerBlock';

it('renders a separator', () => {
  const { getByRole } = render(<DividerBlock />);
  expect(getByRole('separator')).toBeVisible();
});
