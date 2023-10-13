/* eslint decipad/css-prop-named-variable: 0 */

import { AIResponseRating, Message } from '@decipad/react-contexts';
import {
  AssistantChatHeader,
  AssistantMessageInput,
  AssistantMessageList,
} from '@decipad/ui';
import { css } from '@emotion/react';

import { cssVar } from '../../primitives';

const wrapperStyles = css({
  position: 'relative',
  display: 'grid',
  overflow: 'hidden',
  gridTemplateRows: '56px auto max-content',
  height: '100%',
  width: '100%',
  backgroundColor: cssVar('backgroundMain'),
});

type AssistantChatProps = {
  readonly messages: Message[];
  readonly sendMessage: (content: string) => void;
  readonly regenerateResponse: (id: string) => void;
  readonly clearMessages: () => void;
  readonly rateResponse: (id: string, rating: AIResponseRating) => void;
  readonly isGeneratingResponse: boolean;
};

export const AssistantChat: React.FC<AssistantChatProps> = ({
  messages,
  sendMessage,
  regenerateResponse,
  clearMessages,
  rateResponse,
  isGeneratingResponse,
}) => {
  const likeResponse = (id: string) => {
    rateResponse(id, 'like');
  };

  const dislikeResponse = (id: string) => {
    rateResponse(id, 'dislike');
  };

  return (
    <div css={wrapperStyles}>
      <AssistantChatHeader onClear={clearMessages} />
      <AssistantMessageList
        messages={messages}
        handleLikeResponse={likeResponse}
        handleDislikeResponse={dislikeResponse}
        handleRegenerateResponse={regenerateResponse}
      />
      <AssistantMessageInput
        onSubmit={sendMessage}
        isLocked={isGeneratingResponse}
      />
    </div>
  );
};
