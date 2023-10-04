import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

import { AssistantUserMessage } from './AssistantUserMessage';

it('renders text in message', () => {
  const { getByText } = render(
    <SessionProvider
      session={{
        user: { name: 'decipad', image: '' },
        expires: new Date(Date.now() + 100000000).toISOString(),
      }}
    >
      <AssistantUserMessage text="Hello" />
    </SessionProvider>
  );
  expect(getByText('Hello')).toBeVisible();
});
