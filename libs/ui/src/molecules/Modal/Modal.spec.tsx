import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

it('renders a dialog with the children', () => {
  const { getByRole } = render(<Modal>text</Modal>);
  expect(getByRole('dialog')).toHaveTextContent('text');
});

it('can be closed', async () => {
  const closeAction = jest.fn();
  const { getByLabelText } = render(
    <Modal closeAction={closeAction}>text</Modal>
  );

  await userEvent.click(getByLabelText(/close/i));
  expect(closeAction).toHaveBeenCalled();
});
