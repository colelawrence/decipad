/* eslint decipad/css-prop-named-variable: 0 */

import { css } from '@emotion/react';
import { cssVar, p13Medium } from '../../primitives';
import { EventMessage, MessageStatus } from '@decipad/react-contexts';
import { Sparkles, Spinner, Warning } from '../../icons';

const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 2px',
  margin: '4px 0px',
  marginLeft: 32,
  gap: 4,
  borderRadius: 12,
});

const iconStyles = css({
  width: 20,
  height: 20,
  flexShrink: 0,
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  svg: {
    width: 16,
    height: 16,

    path: {
      stroke: cssVar('textSubdued'),
    },
  },
});

const contentStyles = css(p13Medium, {
  color: cssVar('textSubdued'),
  margin: 0,
  padding: 0,
});

type Props = {
  readonly message: EventMessage;
};

const messageMeta = (status: MessageStatus) => {
  switch (status) {
    case 'pending':
      return {
        icon: <Spinner />,
      };
    case 'error':
      return {
        icon: <Warning />,
      };
    case 'success':
      return {
        icon: <Sparkles />,
      };
    default:
      return {
        icon: <Warning />,
      };
  }
};

export const ChatEventMessage: React.FC<Props> = ({ message }) => {
  const { content, status } = message;

  return (
    <div css={wrapperStyles}>
      <div css={iconStyles}>{messageMeta(status).icon}</div>
      <p css={contentStyles}>{content}</p>
    </div>
  );
};
