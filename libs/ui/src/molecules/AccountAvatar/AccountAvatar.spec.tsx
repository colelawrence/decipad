import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountAvatar } from './AccountAvatar';

it('renders an avatar', () => {
  render(<AccountAvatar name="John Doe" menuOpen />);
  expect(screen.getByLabelText(/avatar/i)).toBeVisible();
});

it('allows expanding when closed', () => {
  render(<AccountAvatar name="John Doe" menuOpen={false} />);
  expect(screen.getByTitle(/expand/i)).toBeInTheDocument();
});
it('allows collapsing when open', () => {
  render(<AccountAvatar name="John Doe" menuOpen />);
  expect(screen.getByTitle(/collapse/i)).toBeInTheDocument();
});

it('emits click events', async () => {
  const handleClick = jest.fn();
  render(
    <AccountAvatar name="John Doe" menuOpen={false} onClick={handleClick} />
  );

  await userEvent.click(screen.getByTitle(/expand/i));
  expect(handleClick).toHaveBeenCalled();
});
