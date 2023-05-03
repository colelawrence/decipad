import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { cssVar, p12Bold, p12Regular, setCssVar } from '../../primitives';

interface MessageBlockProps {
  type: 'success' | 'warning' | 'error' | 'annotationWarning';
  icon: ReactNode;
  title?: string;
  message?: string;
  overrideTextColor?: boolean;
}

export const MessageBlock: FC<MessageBlockProps> = ({
  type,
  icon,
  title = '',
  message = '',
  overrideTextColor = false,
}) => {
  return (
    <div css={wrapperStyles(type)}>
      <div css={iconStyles}>{icon}</div>
      <span>
        <span css={overrideTextColor ? titleStyles : p12Bold}>{title} </span>
        <span css={overrideTextColor ? messageStyles : p12Regular}>
          {message}
        </span>
      </span>
    </div>
  );
};

const titleStyles = css({
  ...p12Bold,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
});

const messageStyles = css({
  ...p12Regular,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
});

const getMessageBlockType = (type: string) => {
  switch (type) {
    case 'error':
      return cssVar('errorBlockError');
    case 'warning':
      return cssVar('errorBlockWarning');
    case 'annotationWarning':
      return cssVar('errorBlockAnnotationWarning');
    default:
      return cssVar('toastOk');
  }
};

const wrapperStyles = (type: MessageBlockProps['type']) =>
  css({
    borderRadius: '6px',
    width: '100%',
    backgroundColor: getMessageBlockType(type),
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '16px 20px 16px 10px',
  });

const iconStyles = css({
  width: '24px',
  height: '24px',

  flexShrink: 0,
});
