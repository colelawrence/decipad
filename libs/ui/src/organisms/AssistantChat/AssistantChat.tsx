/* eslint decipad/css-prop-named-variable: 0 */

import { AssistantChatHeader } from '../../molecules/AssistantChatHeader/AssistantChatHeader';
import { AssistantMessageInput } from '../../molecules/AssistantMessageInput/AssistantMessageInput';
import { AssistantMessageList } from '../AssistantMessageList/AssistantMessageList';

import { css } from '@emotion/react';

import { cssVar } from '../../primitives';
import { Message, UserMessage } from '@decipad/react-contexts';
import { MyValue } from '@decipad/editor-types';
import { EElementOrText } from '@udecode/plate-common';

const wrapperStyles = css({
  position: 'relative',
  display: 'grid',
  overflow: 'hidden',
  gridTemplateRows: '32px auto max-content',
  height: '100%',
  width: '100%',
  padding: 16,
  borderRadius: '16px 0px 0px 16px',
  backgroundColor: cssVar('backgroundMain'),
});

type AssistantChatProps = {
  readonly notebookId: string;
  readonly workspaceId: string;
  readonly messages: Message[];
  readonly sendMessage: (content: string) => void;
  readonly clearChat: () => void;
  readonly stopGenerating: () => void;
  readonly regenerateResponse: () => void;
  readonly isGenerating: boolean;
  readonly currentUserMessage?: UserMessage;
  readonly insertNodes: (
    ops: EElementOrText<MyValue> | EElementOrText<MyValue>[]
  ) => void;
  readonly aiCreditsUsed?: number;
  readonly aiQuotaLimit?: number;
  readonly isPremium?: boolean;
  readonly isFirstInteraction: boolean;
};

export const AssistantChat: React.FC<AssistantChatProps> = ({
  messages,
  notebookId,
  workspaceId,
  sendMessage,
  clearChat,
  isGenerating,
  stopGenerating,
  regenerateResponse,
  currentUserMessage,
  insertNodes,
  aiCreditsUsed,
  aiQuotaLimit,
  isPremium = false,
  isFirstInteraction,
}) => {
  return (
    <div css={wrapperStyles}>
      <AssistantChatHeader
        onClear={clearChat}
        creditsUsed={aiCreditsUsed}
        creditsQuotaLimit={aiQuotaLimit}
        isPremium={isPremium}
        onStop={stopGenerating}
        isGenerating={isGenerating}
      />

      <AssistantMessageList
        messages={messages}
        currentUserMessage={currentUserMessage}
        isGenerating={isGenerating}
        regenerateResponse={regenerateResponse}
        notebookId={notebookId}
        workspaceId={workspaceId}
        insertNodes={insertNodes}
      />

      <AssistantMessageInput
        isFirstInteraction={isFirstInteraction}
        onStop={stopGenerating}
        onSubmit={sendMessage}
        isGenerating={isGenerating}
      />
    </div>
  );
};
