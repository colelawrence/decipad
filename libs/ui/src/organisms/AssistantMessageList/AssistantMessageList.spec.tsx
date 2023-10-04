import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

import { AssistantMessageList } from './AssistantMessageList';
import { noop } from '@decipad/utils';

it('renders loading state when generating response', () => {
  const { getByText } = render(
    <AssistantMessageList
      messages={[]}
      isLoading={true}
      handleDislikeResponse={noop}
      handleLikeResponse={noop}
      handleRegenerateResponse={noop}
      handleSuggestChanges={noop}
    />
  );
  expect(getByText('Generating response...')).toBeVisible();
});

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
            replyTo: '1',
          },
        ]}
        isLoading={false}
        handleDislikeResponse={noop}
        handleLikeResponse={noop}
        handleRegenerateResponse={noop}
        handleSuggestChanges={noop}
      />
    </SessionProvider>
  );

  expect(getByTestId('assistant-message-list').children.length).toBe(2);
});
