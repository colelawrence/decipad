import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InlineCodeError } from './InlineCodeError';

it('renders error icon', () => {
  const { getByTitle } = render(<InlineCodeError message="" url="" />);
  expect(getByTitle(/info/i)).toBeInTheDocument();
});

it('renders message when hovering the icon', async () => {
  const { findByText, getByTitle, queryByText } = render(
    <InlineCodeError message="Message" url="" />
  );

  expect(await queryByText('Message')).toBeNull();

  userEvent.hover(getByTitle(/info/i));

  expect(await findByText('Message')).toBeInTheDocument();
});

it('renders documentation url when hovering the icon', async () => {
  const { findByText, getByTitle, queryByText } = render(
    <InlineCodeError message="" url="http://decipad.com" />
  );

  expect(await queryByText(/doc/i)).toBeNull();

  userEvent.hover(getByTitle(/info/i));

  expect(await findByText(/doc/i)).toBeInTheDocument();
  expect(await findByText(/doc/i)).toHaveAttribute(
    'href',
    'http://decipad.com'
  );
});
