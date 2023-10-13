/* eslint decipad/css-prop-named-variable: 0 */
import { Avatar, p14Regular } from '@decipad/ui';

import { User } from '@decipad/interfaces';
import { useSession } from 'next-auth/react';
import { css } from '@emotion/react';
import { cssVar } from '../../primitives';

const wrapperStyles = css({
  display: 'flex',
  padding: '8px 0px',
  width: '100%',
  gap: 8,
});

const avatarStyles = css({
  width: 28,
  height: 28,
  margin: '2px 0px',
  flexShrink: 0,
});

const contentStyles = css(p14Regular, {
  width: '100%',
  lineHeight: '20px',
  padding: '2px 6px',
  backgroundColor: cssVar('backgroundDefault'),
  color: cssVar('textHeavy'),
  borderRadius: 8,

  '& p': {
    padding: 6,
    margin: 0,
  },
});

type AssistantUserMessageProps = {
  readonly text: string;
};

export const AssistantUserMessage: React.FC<AssistantUserMessageProps> = ({
  text,
}) => {
  const { data: session } = useSession();
  const user = session?.user as User;
  const { name, image } = user;

  return (
    <div css={wrapperStyles}>
      <div css={avatarStyles}>
        <Avatar name={name} imageHash={image} useSecondLetter={false} />
      </div>
      <div css={contentStyles}>
        <p>{text}</p>
      </div>
    </div>
  );
};
