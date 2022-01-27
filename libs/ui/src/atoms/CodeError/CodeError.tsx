import { FC } from 'react';
import { css } from '@emotion/react';
import { BracketError } from '@decipad/language';
import { Info } from '../../icons';
import {
  codeErrorIconFill,
  setCssVar,
  p12Regular,
  p12Bold,
} from '../../primitives';
import { Tooltip } from '..';
import { Anchor } from '../../utils';

const iconWrapperStyles = css({
  ...setCssVar('currentTextColor', codeErrorIconFill.rgb),

  cursor: 'pointer',

  alignSelf: 'center',
  display: 'inline-flex',
  '> svg': {
    height: '14px',
    width: '14px',
  },
});

const messageStyles = css({
  textAlign: 'center',
});

const detailMessageStyles = css(p12Bold, {
  textAlign: 'center',
  margin: '0.5rem',
});

const expectedStyles = css(p12Regular, {
  textAlign: 'center',
});

const bracketErrorStyles = css(p12Regular, {
  textAlign: 'center',
});

const urlStyles = css(p12Regular, {
  textDecoration: 'underline',
  margin: '0.5rem',
});

interface CodeErrorProps {
  message: string;
  url: string;
  detailMessage?: string;
  line?: number;
  column?: number;
  expected?: string[];
  bracketError?: BracketError;
}

const tokenLocationString = (token: moo.Token): string => {
  return `line ${token.line}, column ${token.col}`;
};

const bracketErrorMessage = (err: BracketError) => {
  switch (err.type) {
    case 'never-opened':
      return `Closed bracket "${err.close.text}" at ${tokenLocationString(
        err.close
      )} that never opened`;
    case 'mismatched-brackets':
      return `Mismatched bracket "${
        err.open.text
      }" opened at ${tokenLocationString(
        err.open
      )} and closed at ${tokenLocationString(err.close)}`;
    case 'never-closed':
      return `Bracket "${err.open.text}" opened at ${tokenLocationString(
        err.open
      )} is not being closed`;
  }
};

export const CodeError = ({
  message,
  detailMessage,
  line,
  column,
  expected,
  url,
  bracketError,
}: CodeErrorProps): ReturnType<FC> => {
  const lineColString = `${line ? `line ${line}` : ''}${
    line && column ? ', ' : ''
  }${column ? `column ${column}` : ''}`;
  const userMessage = `${message}${
    (lineColString && ` at ${lineColString}`) || ''
  }`;
  return (
    <Tooltip
      trigger={
        <span css={iconWrapperStyles} title={message}>
          <Info />
        </span>
      }
    >
      <span css={messageStyles}>{userMessage}</span>
      {detailMessage && <p css={detailMessageStyles}>{detailMessage}</p>}
      {expected && <p css={expectedStyles}>{expected.join(', ')}</p>}
      {bracketError && (
        <p css={bracketErrorStyles}>{bracketErrorMessage(bracketError)}</p>
      )}
      <Anchor css={urlStyles} href={url}>
        Check our docs
      </Anchor>
    </Tooltip>
  );
};
