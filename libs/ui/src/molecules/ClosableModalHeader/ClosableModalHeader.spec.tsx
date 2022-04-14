import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClosableModalHeader } from './ClosableModalHeader';

it('renders given title as the heading', () => {
  const { getByText } = render(
    <ClosableModalHeader Heading="h1" title="Title" closeAction={noop} />
  );
  expect(getByText('Title').tagName).toBe('H1');
});

it('renders a close link for a close action href', () => {
  const { getByTitle } = render(
    <ClosableModalHeader Heading="h1" title="Title" closeAction="/page" />
  );
  expect(getByTitle(/close/i).closest('a')).toHaveAttribute('href', '/page');
});

it('renders a close button triggering a close action callback', async () => {
  const closeAction = jest.fn();
  const { getByTitle } = render(
    <ClosableModalHeader Heading="h1" title="Title" closeAction={closeAction} />
  );

  await userEvent.click(getByTitle(/close/i));
  expect(closeAction).toHaveBeenCalled();
});
