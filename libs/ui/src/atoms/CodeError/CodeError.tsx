/* eslint decipad/css-prop-named-variable: 0 */
import { ClientEventsContext } from '@decipad/client-events';
import { BracketError } from '@decipad/computer';
import { css } from '@emotion/react';
import { FC, useContext } from 'react';
import { Tooltip } from '..';
import { Warning } from '../../icons';
import { red100, red500, setCssVar } from '../../primitives';
import { Anchor } from '../../utils';

const iconWrapperStyles = css({
  ...setCssVar('iconBackgroundColor', red100.rgb),
  ...setCssVar('currentTextColor', red500.rgb),

  display: 'inline-flex',
  //
  // strange safari bug makes errors not show
  // if this is replaced with simply height and width
  //
  '> svg': {
    height: '16px',
    width: '16px',
  },

  verticalAlign: 'middle',
  cursor: 'pointer',
});

const messageStyles = css({
  textAlign: 'center',
});

const smolStylez = css({
  '> svg': {
    height: 12,
    width: 12,
    marginTop: -2,
  },
});

const urlStyles = css({
  textDecoration: 'underline',
});

interface CodeErrorProps {
  message: string;
  url?: string;
  detailMessage?: string;
  bracketError?: BracketError;
  defaultDocsMessage?: string;
  isEmptyExpressionError?: boolean;
  variant?: 'default' | 'smol';
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

export const CodeError: FC<CodeErrorProps> = ({
  message,
  detailMessage,
  url = '/docs',
  bracketError,
  defaultDocsMessage = 'Check our docs',
  variant = 'default',
}) => {
  const clientEvent = useContext(ClientEventsContext);
  return (
    <Tooltip
      trigger={
        <span
          css={[iconWrapperStyles, variant === 'smol' && smolStylez]}
          title={message}
        >
          <Warning />
        </span>
      }
    >
      <p css={messageStyles}>{message}</p>
      {detailMessage && <p css={messageStyles}>{detailMessage}</p>}
      {bracketError && (
        <p css={messageStyles}>{bracketErrorMessage(bracketError)}</p>
      )}
      <Anchor
        css={urlStyles}
        href={url}
        // Analytics
        onClick={() =>
          clientEvent({
            type: 'action',
            action: 'notebook code error docs link clicked',
          })
        }
      >
        {defaultDocsMessage}
      </Anchor>
    </Tooltip>
  );
};
