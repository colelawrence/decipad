import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Overlay } from './Overlay';

test('closing is disabled without a close action', () => {
  const { getByLabelText } = render(<Overlay />);
  expect(getByLabelText(/close/i)).toBeDisabled();
});

it('links to a close action href', () => {
  const { getByLabelText } = render(<Overlay closeAction="/page" />);
  expect(getByLabelText(/close/i)).toHaveAttribute('href', '/page');
});

it('calls a close action handler', () => {
  const closeAction = jest.fn();
  const { getByLabelText } = render(<Overlay closeAction={closeAction} />);

  userEvent.click(getByLabelText(/close/i));
  expect(closeAction).toHaveBeenCalled();
});
