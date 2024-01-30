import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { timeout } from '@decipad/utils';
import { CodeError } from './CodeError';

it('renders error icon', async () => {
  render(<CodeError message="" url="" />);
  await act(() => timeout(1000));
  expect(screen.getByTitle(/Warning/i)).toBeInTheDocument();
});

it('renders message when hovering the icon', async () => {
  render(<CodeError message="Message" url="" />);
  await act(() => timeout(1000));

  expect(screen.queryByText('Message')).toBeNull();

  await userEvent.hover(screen.getByTitle(/Warning/i));

  expect(await screen.findByText('Message')).toBeInTheDocument();
});

it('renders documentation url when hovering the icon', async () => {
  render(<CodeError message="" url="http://decipad.com/" />);
  await act(() => timeout(1000));

  expect(screen.queryByText(/doc/i)).toBeNull();

  await userEvent.hover(screen.getByTitle(/Warning/i));

  expect(await screen.findByText(/doc/i)).toBeInTheDocument();
  expect(await screen.findByText(/doc/i)).toHaveAttribute(
    'href',
    'http://decipad.com/'
  );
});
