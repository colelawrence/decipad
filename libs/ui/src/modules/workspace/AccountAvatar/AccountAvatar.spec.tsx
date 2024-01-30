import { render, screen } from '@testing-library/react';
import { AccountAvatar } from './AccountAvatar';

it('renders an avatar', () => {
  render(<AccountAvatar name="John Doe" menuOpen />);
  expect(screen.getByLabelText(/avatar/i)).toBeVisible();
});
