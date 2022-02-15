import { render } from '@testing-library/react';
import { DropLine } from './DropLine';

it('renders a presentational element', () => {
  const { getByRole } = render(<DropLine />);
  expect(getByRole('presentation')).toBeVisible();
});
