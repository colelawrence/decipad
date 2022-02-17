import { render } from '@testing-library/react';
import { DropLine } from './DropLine';

it('renders a presentational element', () => {
  const { getByLabelText } = render(<DropLine />);
  expect(getByLabelText(/drop/i)).toBeVisible();
});
