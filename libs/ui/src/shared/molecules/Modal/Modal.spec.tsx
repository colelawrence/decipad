import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';
import { noop } from '@decipad/utils';

it('renders a dialog with the children', () => {
  render(
    <Modal title="modal" open={true} onOpenChange={noop}>
      text
    </Modal>
  );
  expect(screen.getByRole('dialog')).toHaveTextContent('text');
});

it('can be closed', async () => {
  const closeAction = jest.fn();
  render(
    <Modal title="modal" open={true} onOpenChange={noop} onClose={closeAction}>
      text
    </Modal>
  );

  await userEvent.click(screen.getByLabelText(/close/i));
  expect(closeAction).toHaveBeenCalled();
});
