import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Overlay } from './Overlay';

test('closing is disabled without a close action', () => {
  render(<Overlay />);
  expect(screen.getByLabelText(/close/i)).toBeDisabled();
});

it('links to a close action href', () => {
  render(<Overlay closeAction="/page" />);
  expect(screen.getByLabelText(/close/i)).toHaveAttribute('href', '/page');
});

it('calls a close action handler', async () => {
  const closeAction = jest.fn();
  render(<Overlay closeAction={closeAction} />);

  await userEvent.click(screen.getByLabelText(/close/i));
  expect(closeAction).toHaveBeenCalled();
});
