import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountAvatar } from './AccountAvatar';

it('renders an avatar', () => {
  const { getByLabelText } = render(<AccountAvatar name="John Doe" menuOpen />);
  expect(getByLabelText(/avatar/i)).toBeVisible();
});

it('allows expanding when closed', () => {
  const { getByTitle } = render(
    <AccountAvatar name="John Doe" menuOpen={false} />
  );
  expect(getByTitle(/expand/i)).toBeInTheDocument();
});
it('allows collapsing when open', () => {
  const { getByTitle } = render(<AccountAvatar name="John Doe" menuOpen />);
  expect(getByTitle(/collapse/i)).toBeInTheDocument();
});

it('emits click events', async () => {
  const handleClick = jest.fn();
  const { getByTitle } = render(
    <AccountAvatar name="John Doe" menuOpen={false} onClick={handleClick} />
  );

  await userEvent.click(getByTitle(/expand/i));
  expect(handleClick).toHaveBeenCalled();
});
