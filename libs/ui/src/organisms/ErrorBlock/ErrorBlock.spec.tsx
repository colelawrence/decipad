import { render } from '@testing-library/react';
import { ErrorBlock } from '..';

it('renders', () => {
  const { getByText } = render(<ErrorBlock type="error" onDelete={() => {}} />);
  expect(getByText('Delete this block')).toBeVisible();
});
