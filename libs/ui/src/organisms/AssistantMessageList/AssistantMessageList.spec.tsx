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
            status: 'success',
            replyTo: '1',
          },
        ]}
        isProcessing={false}
        canRegenerateResponse={true}
        canSubmitFeedback={true}
        handleRegenerateResponse={noop}
        handleSendPositiveFeedback={noop}
        handleSendNegativeFeedback={noop}
      />
    </SessionProvider>
  );

  expect(getByTestId('assistant-message-list').children.length).toBe(2);
});

it('renders enabled like and dislike buttons when not processing', () => {
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
            status: 'success',
            replyTo: '1',
          },
        ]}
        isProcessing={false}
        canRegenerateResponse={true}
        canSubmitFeedback={true}
        handleRegenerateResponse={noop}
        handleSendPositiveFeedback={noop}
        handleSendNegativeFeedback={noop}
      />
    </SessionProvider>
  );

  expect(getByTestId('like-button')).toBeEnabled();
  expect(getByTestId('dislike-button')).toBeEnabled();
});

it('renders disabled like and dislike buttons when processing', () => {
  const { queryByTestId } = render(
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
            status: 'success',
            replyTo: '1',
          },
        ]}
        isProcessing={true}
        canRegenerateResponse={true}
        canSubmitFeedback={true}
        handleRegenerateResponse={noop}
        handleSendPositiveFeedback={noop}
        handleSendNegativeFeedback={noop}
      />
    </SessionProvider>
  );

  expect(queryByTestId('like-button')).toBeDisabled();
  expect(queryByTestId('dislike-button')).toBeDisabled();
});

it('does not render like and dislike buttons when there is no data to submit', () => {
  const { queryByTestId } = render(
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
            status: 'success',
            replyTo: '1',
          },
        ]}
        isProcessing={false}
        canRegenerateResponse={true}
        canSubmitFeedback={false}
        handleRegenerateResponse={noop}
        handleSendPositiveFeedback={noop}
        handleSendNegativeFeedback={noop}
      />
    </SessionProvider>
  );

  expect(queryByTestId('like-button')).toBeNull();
  expect(queryByTestId('dislike-button')).toBeNull();
});
