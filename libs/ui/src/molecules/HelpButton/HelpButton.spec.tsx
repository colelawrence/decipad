import { render, screen } from '@testing-library/react';
import { HelpButton } from './HelpButton';

it('renders a link to help docs', () => {
  render(<HelpButton />);
  expect(screen.getByLabelText(/help/i)).toHaveAttribute('href');
});
