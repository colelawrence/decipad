/* eslint decipad/css-prop-named-variable: 0 */

import { Message } from '@decipad/react-contexts';
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
  readonly submitFeedback: (
    rating: 'like' | 'dislike'
  ) => (message: string) => void;
  readonly sendMessage: (content: string) => void;
  readonly regenerateResponse: () => void;
  readonly clearChat: () => void;
  readonly canRegenerateResponse: boolean;
  readonly canSubmitFeedback: boolean;
  readonly isGeneratingResponse: boolean;
  readonly isGeneratingChanges: boolean;
};

export const AssistantChat: React.FC<AssistantChatProps> = ({
  messages,
  submitFeedback,
  sendMessage,
  regenerateResponse,
  clearChat,
  canRegenerateResponse,
  canSubmitFeedback,
  isGeneratingResponse,
  isGeneratingChanges,
}) => {
  return (
    <div css={wrapperStyles}>
      <AssistantChatHeader onClear={clearChat} />

      <AssistantMessageList
        messages={messages}
        handleRegenerateResponse={regenerateResponse}
        handleSendPositiveFeedback={submitFeedback('like')}
        handleSendNegativeFeedback={submitFeedback('dislike')}
        isProcessing={isGeneratingResponse || isGeneratingChanges}
        canRegenerateResponse={canRegenerateResponse}
        canSubmitFeedback={canSubmitFeedback}
      />

      <AssistantMessageInput
        onSubmit={sendMessage}
        isLocked={isGeneratingResponse}
      />
    </div>
  );
};
