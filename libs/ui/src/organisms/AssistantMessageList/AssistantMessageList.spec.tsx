import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

import { AssistantMessageList } from './AssistantMessageList';
import { Message } from '@decipad/react-contexts';

const intersectionObserverMock = () => ({
  observe: () => null,
});
window.IntersectionObserver = jest
  .fn()
  .mockImplementation(intersectionObserverMock);

describe('<AssistantMessageList />', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      type: 'user',
      content: 'User message content',
      status: 'success',
      timestamp: Date.now(),
    },
    {
      id: '2',
      type: 'assistant',
      content: 'Assistant message content',
      status: 'success',
      timestamp: Date.now(),
      replyTo: '1',
    },
  ];

  it('renders without crashing', () => {
    const { getByTestId } = render(
      <AssistantMessageList
        messages={[]}
        notebookId=""
        workspaceId=""
        insertNodes={() => {}}
      />
    );
    expect(getByTestId('assistant-message-list')).toBeInTheDocument();
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
          messages={mockMessages}
          notebookId=""
          workspaceId=""
          insertNodes={() => {}}
        />
      </SessionProvider>
    );

    expect(getByTestId('assistant-message-list').children.length).toBe(2);
  });
});
