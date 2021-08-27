import { render } from '@testing-library/react';
import { HelpButton } from './HelpButton';

it('renders a link to help docs', () => {
  const { getByLabelText } = render(<HelpButton />);
  expect(getByLabelText(/help/i)).toHaveAttribute('href');
});
