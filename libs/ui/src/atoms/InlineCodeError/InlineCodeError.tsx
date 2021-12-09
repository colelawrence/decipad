import { FC } from 'react';
import { css } from '@emotion/react';
import { Info } from '../../icons';
import {
  code,
  codeErrorIconFill,
  setCssVar,
  p12Regular,
} from '../../primitives';
import { Tooltip } from '..';

const wrapperStyles = css({
  lineHeight: code.lineHeight,
  padding: '8.5px 0',
});

const iconWrapperStyles = css({
  ...setCssVar('currentTextColor', codeErrorIconFill.rgb),

  cursor: 'pointer',

  display: 'flex',
  height: '14px',
  width: '14px',
});

const messageStyles = css({
  textAlign: 'center',
});

const urlStyles = css(p12Regular, {
  textDecoration: 'underline',
});

interface InlineCodeErrorProps {
  message: string;
  url: string;
}

export const InlineCodeError = ({
  message,
  url,
}: InlineCodeErrorProps): ReturnType<FC> => {
  return (
    <div css={wrapperStyles}>
      <Tooltip
        trigger={
          <span css={iconWrapperStyles} title={message}>
            <Info />
          </span>
        }
      >
        <span css={messageStyles}>{message}</span>
        <a css={urlStyles} href={url}>
          Check our docs
        </a>
      </Tooltip>
    </div>
  );
};
