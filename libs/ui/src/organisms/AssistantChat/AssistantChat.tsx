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
  gridTemplateRows: '44px auto 44px',
  height: '100%',
  width: '100%',
  backgroundColor: cssVar('backgroundDefault'),
  gap: 2,
});

type AssistantChatProps = {
  readonly messages: Message[];
  readonly sendMessage: (content: string) => void;
  readonly regenerateResponse: (id: string) => void;
  readonly suggestChanges: (id: string) => void;
  readonly clearMessages: () => void;
  readonly rateResponse: (id: string, rating: AIResponseRating) => void;
  readonly loading: boolean;
};

export const AssistantChat: React.FC<AssistantChatProps> = ({
  messages,
  sendMessage,
  regenerateResponse,
  suggestChanges,
  clearMessages,
  rateResponse,
  loading,
}) => {
  const handleLikeResponse = (id: string) => {
    rateResponse(id, 'like');
  };

  const handleDislikeResponse = (id: string) => {
    rateResponse(id, 'dislike');
  };

  return (
    <div css={wrapperStyles}>
      <AssistantChatHeader onClear={clearMessages} />
      <AssistantMessageList
        messages={messages}
        isLoading={loading}
        handleLikeResponse={handleLikeResponse}
        handleDislikeResponse={handleDislikeResponse}
        handleRegenerateResponse={regenerateResponse}
        handleSuggestChanges={suggestChanges}
      />
      <AssistantMessageInput onSubmit={sendMessage} />
    </div>
  );
};
