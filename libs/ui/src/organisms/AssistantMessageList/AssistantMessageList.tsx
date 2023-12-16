/* eslint decipad/css-prop-named-variable: 0 */

import { css } from '@emotion/react';
import { LayoutGroup, motion } from 'framer-motion';
import { deciOverflowYStyles } from '../../styles/scrollbars';

import {
  ChatAssistantMessage,
  ChatUserMessage,
  ChatEventMessage,
  ChatEventGroupMessage,
  ChatIntegrationMessage,
} from '../../molecules';
import {
  AssistantMessage,
  Message,
  UserMessage,
} from '@decipad/react-contexts';
import { useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@decipad/interfaces';
import { EElementOrText } from '@udecode/plate-common';
import { MyValue } from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { noop } from '@decipad/utils';
import { cssVar } from '../../primitives';

const wrapperStyles = css({
  position: 'relative',
  width: 608,
  height: '100%',

  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: 608,
    height: 40,
    zIndex: 1,
    backgroundImage: `linear-gradient(to bottom, ${cssVar(
      'backgroundMain'
    )} 0%, transparent 100%)`,
  },
});

const containerStyles = css(
  {
    position: 'absolute',
    overflowX: 'hidden',
    width: 624,
    height: '100%',
    display: 'flex',
    paddingTop: 8,
    flexDirection: 'column',
  },
  deciOverflowYStyles
);

const listStyles = css({
  display: 'flex',
  flexDirection: 'column',
  padding: 8,
  width: 608,
});

const messageWrapperStyles = css({
  width: '100%',
});

const DEFAULT_GREETING_MESSAGE: AssistantMessage = {
  id: nanoid(),
  type: 'assistant',
  status: 'success',
  content:
    'Hey there! Keep in mind that this **experimental** version can make mistakes. Please, provide feedback to help us improve.',
  timestamp: Date.now(),
  replyTo: null,
};

type AssistantMessageListProps = {
  readonly messages: Message[];
  readonly isGenerating: boolean;
  readonly currentUserMessage?: UserMessage;
  readonly regenerateResponse: () => void;
  readonly notebookId: string;
  readonly workspaceId: string;
  readonly insertNodes: (
    op: EElementOrText<MyValue> | EElementOrText<MyValue>[]
  ) => void;
};

export const AssistantMessageList: React.FC<AssistantMessageListProps> = ({
  messages,
  isGenerating,
  currentUserMessage,
  regenerateResponse,
  notebookId,
  workspaceId,
  insertNodes,
}) => {
  const { data: session } = useSession();
  const user = session?.user;

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const submitFeedback = useCallback(
    async (message: string) => {
      const body = {
        user,
        history: messages,
        message,
      };

      const response = await fetch(`/api/ai/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status !== 200) {
        const err = await response.json();

        throw new Error(err.message);
      }
    },
    [messages, user]
  );

  const submitRating = useCallback(
    async (rating: 'like' | 'dislike') => {
      const body = {
        user,
        history: messages,
        rating,
      };

      const response = await fetch(`/api/ai/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status !== 200) {
        const err = await response.json();

        throw new Error(err.message);
      }
    },
    [messages, user]
  );

  return (
    <motion.div css={wrapperStyles}>
      <motion.div css={containerStyles} layoutScroll ref={chatContainerRef}>
        <motion.div
          css={listStyles}
          data-testid="assistant-message-list"
          layout
        >
          <LayoutGroup>
            <motion.div
              layout="position"
              css={messageWrapperStyles}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              <ChatAssistantMessage
                key={DEFAULT_GREETING_MESSAGE.id}
                message={DEFAULT_GREETING_MESSAGE}
                isCurrentReply={false}
                isGenerating={false}
                regenerateResponse={noop}
                submitFeedback={noop}
                submitRating={noop}
              />
            </motion.div>
            {messages.map((entry) => {
              const { id, type, replyTo } = entry;

              if (type === 'user') {
                return (
                  <motion.div
                    layout="position"
                    css={messageWrapperStyles}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <ChatUserMessage
                      key={id}
                      message={entry}
                      user={user as User}
                    />
                  </motion.div>
                );
              }

              if (type === 'assistant') {
                const { integrationData } = entry;
                if (integrationData) {
                  return (
                    <motion.div
                      layout="position"
                      css={messageWrapperStyles}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <ChatIntegrationMessage
                        key={id}
                        message={entry}
                        notebookId={notebookId}
                        workspaceId={workspaceId}
                        insertNodes={insertNodes}
                      />
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    layout="position"
                    css={messageWrapperStyles}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <ChatAssistantMessage
                      key={id}
                      message={entry}
                      isCurrentReply={currentUserMessage?.id === replyTo}
                      isGenerating={isGenerating}
                      regenerateResponse={regenerateResponse}
                      submitFeedback={submitFeedback}
                      submitRating={submitRating}
                    />
                  </motion.div>
                );
              }

              if (type === 'event') {
                const { events, status } = entry;
                if (events) {
                  return (
                    <motion.div
                      layout="position"
                      css={messageWrapperStyles}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <ChatEventGroupMessage
                        key={id}
                        status={status}
                        events={events}
                      />
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    layout="position"
                    css={messageWrapperStyles}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <ChatEventMessage
                      key={id}
                      message={entry}
                      isCurrentReply={currentUserMessage?.id === replyTo}
                      isGenerating={isGenerating}
                      regenerateResponse={regenerateResponse}
                      submitFeedback={submitFeedback}
                    />
                  </motion.div>
                );
              }

              return null;
            })}
          </LayoutGroup>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
