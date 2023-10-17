/* eslint decipad/css-prop-named-variable: 0 */
import { AssistantUserMessage, AssistantAIMessage } from '@decipad/ui';

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
  },
  deciOverflowYStyles
);

const listStyles = css({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 16px',
  width: 632,
});

type AssistantMessageListProps = {
  readonly messages: Message[];
  readonly handleLikeResponse: (id: string) => void;
  readonly handleDislikeResponse: (id: string) => void;
  readonly handleRegenerateResponse: (id: string) => void;
};

export const AssistantMessageList: React.FC<AssistantMessageListProps> = ({
  messages,
  handleLikeResponse,
  handleDislikeResponse,
  handleRegenerateResponse,
}) => {
  const ratedResponses = useAIChatHistory((state) => state.ratedResponses);

  return (
    <div css={wrapperStyles}>
      <div css={listStyles} data-testid="assistant-message-list">
        {messages.map((message, index, array) => {
          const { id, role, type } = message;

          const responseRating = ratedResponses.find(
            (response) => response.messageId === id
          )?.rating;

          if (role === 'user') {
            return (
              <AssistantUserMessage key={id} text={message.content || ''} />
            );
          }

          if (role === 'assistant' && 'content' in message) {
            return (
              <AssistantAIMessage
                key={id}
                type={type}
                text={message.content}
                rating={responseRating}
                canRegenerate={index === array.length - 1}
                handleLikeResponse={() => handleLikeResponse(id)}
                handleDislikeResponse={() => handleDislikeResponse(id)}
                handleRegenerateResponse={() => handleRegenerateResponse(id)}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
