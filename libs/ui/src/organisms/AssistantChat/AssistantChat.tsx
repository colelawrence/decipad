/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';

import { cssVar } from '../../primitives';
import { Message } from '@decipad/react-contexts';
import { AssistantChatHeader, AssistantMessageInput } from '../../molecules';
import { AssistantMessageList } from '..';
import { EElementOrText } from '@udecode/plate-common';
import { MyValue } from '@decipad/editor-types';

const wrapperStyles = css({
  position: 'relative',
  display: 'grid',
  overflow: 'hidden',
  gridTemplateRows: '36px auto max-content',
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
  readonly isGenerating: boolean;
  readonly insertNodes: (
    ops: EElementOrText<MyValue> | EElementOrText<MyValue>[]
  ) => void;
  readonly aiCreditsUsed?: number;
  readonly aiQuotaLimit?: number;
  readonly isPremium?: boolean;
};

export const AssistantChat: React.FC<AssistantChatProps> = ({
  messages,
  notebookId,
  workspaceId,
  sendMessage,
  clearChat,
  isGenerating,
  insertNodes,
  aiCreditsUsed,
  aiQuotaLimit,
  isPremium = false,
}) => {
  return (
    <div css={wrapperStyles}>
      <AssistantChatHeader
        onClear={clearChat}
        creditsUsed={aiCreditsUsed}
        creditsQuotaLimit={aiQuotaLimit}
        isPremium={isPremium}
      />

      <AssistantMessageList
        messages={messages}
        notebookId={notebookId}
        workspaceId={workspaceId}
        insertNodes={insertNodes}
      />

      <AssistantMessageInput
        onSubmit={sendMessage}
        isGenerating={isGenerating}
      />
    </div>
  );
};
