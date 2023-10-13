import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

import { AssistantMessageList } from './AssistantMessageList';
import { noop } from '@decipad/utils';

it('renders 2 messages', () => {
  const { getByTestId } = render(
    <SessionProvider
      session={{
        user: { name: 'decipad', image: '' },
        expires: new Date(Date.now() + 100000000).toISOString(),
      }}
    >
      <AssistantMessageList
        messages={[
          {
            id: '1',
            role: 'user',
            content: 'Hello',
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Hola',
            type: 'success',
            replyTo: '1',
          },
        ]}
        handleDislikeResponse={noop}
        handleLikeResponse={noop}
        handleRegenerateResponse={noop}
      />
    </SessionProvider>
  );

  expect(getByTestId('assistant-message-list').children.length).toBe(2);
});
