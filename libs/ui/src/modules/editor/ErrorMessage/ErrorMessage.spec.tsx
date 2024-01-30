import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

it('renders the message', () => {
  render(<ErrorMessage error="this is the error message" />);
  expect(screen.getByText('this is the error message')).toBeVisible();
});
