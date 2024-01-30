import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AccountMenu } from './AccountMenu';

const props: ComponentProps<typeof AccountMenu> = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  onOpenSettings: noop,
};

it('shows the username', () => {
  const { container } = render(
    <DndProvider backend={HTML5Backend}>
      <AccountMenu {...props} name="John Doe" />
    </DndProvider>
  );
  expect(container).toHaveTextContent('John Doe');
});
it('shows the email', () => {
  const { container } = render(
    <DndProvider backend={HTML5Backend}>
      <AccountMenu {...props} email="john.doe@example.com" />
    </DndProvider>
  );
  expect(container).toHaveTextContent('john.doe@example.com');
});

it('allows logging out', async () => {
  const handleLogout = jest.fn();
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <AccountMenu {...props} onLogout={handleLogout} />
    </DndProvider>
  );

  await userEvent.click(
    getByText(/log.*out/i, { selector: '[data-testid="log out"]' })
  );
  expect(handleLogout).toHaveBeenCalled();
});
