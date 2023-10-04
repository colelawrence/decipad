/* eslint decipad/css-prop-named-variable: 0 */
import { Avatar, p14Regular } from '@decipad/ui';

import { User } from '@decipad/interfaces';
import { useSession } from 'next-auth/react';
import { css } from '@emotion/react';
import { componentCssVars } from '../../primitives';

const wrapperStyles = css({
  display: 'flex',
  padding: '8px 20px',
  width: '100%',
  gap: 6,
  backgroundColor: componentCssVars('AIAssistantElevationColor'),
});

const avatarStyles = css({
  width: 28,
  height: 28,
  margin: '2px 0px',
  flexShrink: 0,
});

const contentStyles = css(p14Regular, {
  lineHeight: '20px',
  padding: '0px 6px',
  color: componentCssVars('AIAssistantTextColor'),

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
  // TODO: This could probably be part of the message object
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
