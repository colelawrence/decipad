import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CodeError } from './CodeError';

it('renders error icon', () => {
  const { getByTitle } = render(<CodeError message="" url="" />);
  expect(getByTitle(/Warning/i)).toBeInTheDocument();
});

it('renders message when hovering the icon', async () => {
  const { findByText, getByTitle, queryByText } = render(
    <CodeError message="Message" url="" />
  );

  expect(await queryByText('Message')).toBeNull();

  await userEvent.hover(getByTitle(/Warning/i));

  expect(await findByText('Message')).toBeInTheDocument();
});

it('renders documentation url when hovering the icon', async () => {
  const { findByText, getByTitle, queryByText } = render(
    <CodeError message="" url="http://decipad.com/" />
  );

  expect(await queryByText(/doc/i)).toBeNull();

  await userEvent.hover(getByTitle(/Warning/i));

  expect(await findByText(/doc/i)).toBeInTheDocument();
  expect(await findByText(/doc/i)).toHaveAttribute(
    'href',
    'http://decipad.com/'
  );
});
