/* eslint decipad/css-prop-named-variable: 0 */
import { ClientEventsContext } from '@decipad/client-events';
import type { Parser } from '@decipad/language-interfaces';
import { css } from '@emotion/react';
import { FC, useContext } from 'react';
import { Tooltip } from '../../../shared';
import { Warning } from '../../../icons';
import { Anchor } from '../../../utils';

const iconWrapperStyles = css({
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
  bracketError?: Parser.BracketError;
  defaultDocsMessage?: string;
  isEmptyExpressionError?: boolean;
  variant?: 'default' | 'smol';
}

const bracketErrorMessage = (err: Parser.BracketError) => {
  switch (err.type) {
    case 'never-opened':
      return `Closed a bracket "${err.close.text}" that was never opened`;
    case 'mismatched-brackets': {
      if (err.open.text === 'if') {
        return 'Incomplete statement, requires all of if <condition> then <result1> else <result2>';
      }
      return `Mismatched brackets "${err.open.text}" and "${err.close.text}"`;
    }
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
  // Muting "expected expression" when the codeLine is empty
  if (message !== 'Expected expression') {
    return (
      <Tooltip
        trigger={
          <span
            css={[iconWrapperStyles, variant === 'smol' && smolStylez]}
            title={message}
            data-testid="code-line-warning"
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
              segmentEvent: {
                type: 'action',
                action: 'notebook code error docs link clicked',
              },
            })
          }
        >
          {defaultDocsMessage}
        </Anchor>
      </Tooltip>
    );
  }
  return <></>;
};
