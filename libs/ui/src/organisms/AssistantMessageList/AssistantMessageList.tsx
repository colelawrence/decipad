/* eslint decipad/css-prop-named-variable: 0 */
import {
  AssistantUserMessage,
  AssistantAIMessage,
  p14Regular,
} from '@decipad/ui';

import { componentCssVars } from '../../primitives';

import { Message, useAIChatHistory } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { deciOverflowYStyles } from '../../styles/scrollbars';

const wrapperStyles = css(
  {
    position: 'relative',
    overflowX: 'hidden',
    width: 640,
    height: '100%',
    display: 'flex',
    flexDirection: 'column-reverse',
    backgroundColor: componentCssVars('AIAssistantBackgroundColor'),
  },
  deciOverflowYStyles
);

const listStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '8px 0px',
  width: '100%',
});

const loadingTextStyles = css(p14Regular, {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: 44,
  padding: '0px 24px',
  color: componentCssVars('AIAssistantTextSubduedColor'),
});

type AssistantMessageListProps = {
  readonly messages: Message[];
  readonly isLoading: boolean;
  readonly handleLikeResponse: (id: string) => void;
  readonly handleDislikeResponse: (id: string) => void;
  readonly handleRegenerateResponse: (id: string) => void;
  readonly handleSuggestChanges: (id: string) => void;
};

export const AssistantMessageList: React.FC<AssistantMessageListProps> = ({
  messages,
  isLoading,
  handleLikeResponse,
  handleDislikeResponse,
  handleRegenerateResponse,
  handleSuggestChanges,
}) => {
  const ratedResponses = useAIChatHistory((state) => state.ratedResponses);

  return (
    <div css={wrapperStyles}>
      <div css={listStyles} data-testid="assistant-message-list">
        {messages.map((message) => {
          const { id, role, content } = message;

          const responseRating = ratedResponses.find(
            (response) => response.messageId === id
          )?.rating;

          return (
            (role === 'user' && (
              <AssistantUserMessage key={id} text={content || ''} />
            )) ||
            (role === 'assistant' && (
              <AssistantAIMessage
                key={id}
                text={content}
                rating={responseRating}
                handleSuggestChanges={() => handleSuggestChanges(id)}
                handleLikeResponse={() => handleLikeResponse(id)}
                handleDislikeResponse={() => handleDislikeResponse(id)}
                handleRegenerateResponse={() => handleRegenerateResponse(id)}
              />
            ))
          );
        })}
        {isLoading && <p css={loadingTextStyles}>Generating response...</p>}
      </div>
    </div>
  );
};
