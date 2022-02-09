import { FC } from 'react';
import { css } from '@emotion/react';
import { BracketError } from '@decipad/language';
import { Warning } from '../../icons';
import {
  red600,
  setCssVar,
  p12Regular,
  red200,
  white,
  p12Medium,
} from '../../primitives';
import { Tooltip } from '..';
import { Anchor } from '../../utils';

const iconWrapperStyles = css({
  ...setCssVar('iconBackgroundColor', red200.rgb),
  ...setCssVar('currentTextColor', red600.rgb),

  cursor: 'pointer',

  alignSelf: 'center',
  display: 'inline-flex',
  '> svg': {
    height: '14px',
    width: '14px',
  },
});

const messageStyles = css(p12Medium, {
  color: white.rgb,
  textAlign: 'center',
});

const urlStyles = css(p12Regular, {
  textDecoration: 'underline',
});

interface CodeErrorProps {
  message: string;
  url: string;
  detailMessage?: string;
  bracketError?: BracketError;
}

const bracketErrorMessage = (err: BracketError) => {
  switch (err.type) {
    case 'never-opened':
      return `Closed a bracket "${err.close.text}" that was never opened`;
    case 'mismatched-brackets':
      return `Mismatched brackets "${err.open.text}" and "${err.close.text}"`;
    case 'never-closed':
      return `Bracket "${err.open.text}" was opened but it is not being closed`;
  }
};

export const CodeError = ({
  message,
  detailMessage,
  url,
  bracketError,
}: CodeErrorProps): ReturnType<FC> => {
  return (
    <Tooltip
      trigger={
        <span css={iconWrapperStyles} title={message}>
          <Warning />
        </span>
      }
    >
      <p css={messageStyles}>{message}</p>
      {detailMessage && <p css={messageStyles}>{detailMessage}</p>}
      {bracketError && (
        <p css={messageStyles}>{bracketErrorMessage(bracketError)}</p>
      )}
      <Anchor css={urlStyles} href={url}>
        Check our docs
      </Anchor>
    </Tooltip>
  );
};
