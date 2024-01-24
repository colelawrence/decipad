/* eslint decipad/css-prop-named-variable: 0 */
import { User } from '@decipad/interfaces';
import { css } from '@emotion/react';
import { cssVar, p14Regular } from '../../primitives';
import { ChatMarkdownRenderer } from '../ChatMarkdownRenderer/ChatMarkdownRenderer';
import { UserMessage } from '@decipad/react-contexts';
import { Avatar } from '../../atoms';

const wrapperStyles = css({
  display: 'flex',
  padding: '8px 0px',
  gap: 4,
});

const avatarStyles = css({
  width: 28,
  height: 28,
  margin: '4px 0px',
  flexShrink: 0,
});

const contentStyles = css(p14Regular, {
  lineHeight: '22px',
  padding: '0px 6px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: cssVar('backgroundDefault'),
  color: cssVar('textHeavy'),
  borderRadius: 12,
});

type Props = {
  readonly message: UserMessage;
  readonly user: User;
};

export const ChatUserMessage: React.FC<Props> = ({ message, user }) => {
  const { name, image } = user;

  const { content } = message;

  return (
    <div css={wrapperStyles}>
      <div css={avatarStyles}>
        <Avatar name={name} imageHash={image} useSecondLetter={false} />
      </div>
      <div css={contentStyles}>
        <ChatMarkdownRenderer content={content} />
      </div>
    </div>
  );
};
