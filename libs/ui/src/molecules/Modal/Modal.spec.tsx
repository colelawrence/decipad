import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

it('renders a dialog with the children', () => {
  render(<Modal>text</Modal>);
  expect(screen.getByRole('dialog')).toHaveTextContent('text');
});

it('can be closed', async () => {
  const closeAction = jest.fn();
  render(<Modal closeAction={closeAction}>text</Modal>);

  await userEvent.click(screen.getByLabelText(/close/i));
  expect(closeAction).toHaveBeenCalled();
});
