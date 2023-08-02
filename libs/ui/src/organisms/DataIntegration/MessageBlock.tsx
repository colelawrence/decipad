/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import {
  componentCssVars,
  cssVar,
  p12Bold,
  p12Regular,
} from '../../primitives';

interface MessageBlockProps {
  type: 'success' | 'warning' | 'error' | 'annotationWarning';
  icon: ReactNode;
  title?: string;
  message?: string;
  extraButtonText?: string;
  extraButtonClick?: () => void;
}

const extraButtonStyles = css(p12Regular, {
  position: 'absolute',
  right: '20px',
  textDecoration: 'underline',
});

export const MessageBlock: FC<MessageBlockProps> = ({
  type,
  icon,
  title = '',
  message = '',
  extraButtonText,
  extraButtonClick,
}) => {
  return (
    <div css={wrapperStyles(type)}>
      <div css={iconStyles}>{icon}</div>
      <span>
        <span css={p12Bold}>{title} </span>
        <span css={p12Regular}>{message}</span>
        {extraButtonClick && extraButtonText && (
          <button css={extraButtonStyles} onClick={extraButtonClick}>
            {extraButtonText}
          </button>
        )}
      </span>
    </div>
  );
};

const getMessageBlockType = (type: string) => {
  switch (type) {
    case 'error':
      return {
        backgroundColor: componentCssVars('ErrorBlockError'),
        color: cssVar('textDefault'),
      };
    case 'warning':
      return {
        backgroundColor: componentCssVars('ErrorBlockWarning'),
        color: cssVar('textDefault'),
      };
    case 'annotationWarning':
      return {
        backgroundColor: componentCssVars('ErrorBlockAnnotationWarning'),
        color: cssVar('textDefault'),
      };
    default:
      return {
        backgroundColor: cssVar('stateOkBackground'),
        color: cssVar('textDefault'),
      };
  }
};

const wrapperStyles = (type: MessageBlockProps['type']) =>
  css({
    ...getMessageBlockType(type),
    borderRadius: '6px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '16px 20px 16px 10px',
    position: 'relative',
  });

const iconStyles = css({
  width: '24px',
  height: '24px',

  flexShrink: 0,
});
