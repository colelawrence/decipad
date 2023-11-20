/* eslint decipad/css-prop-named-variable: 0 */

import {
  AssistantChatHeader,
  AssistantMessageInput,
  AssistantMessageList,
} from '@decipad/ui';
import { css } from '@emotion/react';

import { cssVar } from '../../primitives';
import { Message } from '@decipad/react-contexts';

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
  readonly messages: Message[];
  readonly sendMessage: (content: string) => void;
  readonly clearChat: () => void;
  readonly isGenerating: boolean;
};

export const AssistantChat: React.FC<AssistantChatProps> = ({
  messages,
  sendMessage,
  clearChat,
  isGenerating,
}) => {
  return (
    <div css={wrapperStyles}>
      <AssistantChatHeader onClear={clearChat} />

      <AssistantMessageList messages={messages} />

      <AssistantMessageInput
        onSubmit={sendMessage}
        isGenerating={isGenerating}
      />
    </div>
  );
};
