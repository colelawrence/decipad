import { noop } from '@decipad/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClosableModalHeader } from './ClosableModalHeader';

it('renders given title as the heading', () => {
  render(<ClosableModalHeader Heading="h1" title="Title" closeAction={noop} />);
  expect(screen.getByText('Title').tagName).toBe('H1');
});

it('renders a close link for a close action href', () => {
  render(
    <ClosableModalHeader Heading="h1" title="Title" closeAction="/page" />
  );
  expect(screen.getByTitle(/close/i).closest('a')).toHaveAttribute(
    'href',
    '/page'
  );
});

it('renders a close button triggering a close action callback', async () => {
  const closeAction = jest.fn();
  render(
    <ClosableModalHeader Heading="h1" title="Title" closeAction={closeAction} />
  );

  await userEvent.click(screen.getByTitle(/close/i));
  expect(closeAction).toHaveBeenCalled();
});
