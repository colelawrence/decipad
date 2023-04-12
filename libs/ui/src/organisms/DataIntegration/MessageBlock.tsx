import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { cssVar, p12Bold, p12Regular } from '../../primitives';

interface MessageBlockProps {
  type: 'success' | 'warning' | 'error';
  icon: ReactNode;
  title?: string;
  message?: string;
}

export const MessageBlock: FC<MessageBlockProps> = ({
  type,
  icon,
  title = '',
  message = '',
}) => {
  return (
    <div css={wrapperStyles(type)}>
      <div css={iconStyles}>{icon}</div>
      <span>
        <span css={p12Bold}>{title} </span>
        <span css={p12Regular}>{message}</span>
      </span>
    </div>
  );
};

const wrapperStyles = (type: MessageBlockProps['type']) =>
  css({
    borderRadius: '6px',
    width: '100%',
    backgroundColor:
      type === 'error'
        ? cssVar('errorBlockError')
        : type === 'warning'
        ? cssVar('errorBlockWarning')
        : cssVar('toastOk'),

    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '16px 20px 16px 10px',
  });

const iconStyles = css({
  width: '16px',
  height: '16px',

  flexShrink: 0,
});
