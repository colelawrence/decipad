import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';

import { AccountMenu } from './AccountMenu';

const props: ComponentProps<typeof AccountMenu> = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  onOpenSettings: noop,
};

it('shows the username', () => {
  const { container } = render(<AccountMenu {...props} name="John Doe" />);
  expect(container).toHaveTextContent('John Doe');
});
it('shows the email', () => {
  const { container } = render(
    <AccountMenu {...props} email="john.doe@example.com" />
  );
  expect(container).toHaveTextContent('john.doe@example.com');
});

it('allows logging out', async () => {
  const handleLogout = jest.fn();
  const { getByText } = render(
    <AccountMenu {...props} onLogout={handleLogout} />
  );

  await userEvent.click(getByText(/log.*out/i, { selector: 'nav li button' }));
  expect(handleLogout).toHaveBeenCalled();
});
