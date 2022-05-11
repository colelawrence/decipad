import { Result } from '@decipad/computer';
import { css } from '@emotion/react';
import React, { ComponentProps, ReactNode } from 'react';
import { CodeResult } from '..';
import { CodeError } from '../../atoms';
import {
  code,
  cssVar,
  p14Medium,
  p14Regular,
  setCssVar,
} from '../../primitives';
import { blockAlignment, codeBlock } from '../../styles';
import { isTabularType } from '../../utils/results';

const { lineHeight } = codeBlock;

const spacingStyles = css({
  paddingTop: blockAlignment.codeLine.paddingTop,
});

const highlightedLineStyles = {
  borderColor: cssVar('strongerHighlightColor'),
};

const codeLineStyles = css({
  backgroundColor: cssVar('highlightColor'),
  ':hover': highlightedLineStyles,

  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '10px',

  display: 'grid',
  gridGap: '0 5%',
  // `minmax(0, 70%)` prevents a grid blowout when code line is made out of huge consecutive text.
  gridTemplate: `
    "code            inline-res  " 1fr
    "expanded-res    expanded-res" auto
    /minmax(0, 70%)  25%
  `,

  padding: '4px 10px',
});

const inlineStyles = css({
  gridArea: 'inline-res',

  maxWidth: '100%',
  display: 'flex',
  justifySelf: 'end',
  alignSelf: 'center',

  userSelect: 'none',
});

const codeStyles = css(code, {
  gridArea: 'code',
  padding: '3px 0',
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  lineHeight,
  whiteSpace: 'pre-wrap',
});

const inlineResultStyles = css(p14Regular, {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  padding: '2px 8px',

  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
});

const expandedResultStyles = css(p14Medium, {
  gridArea: 'expanded-res',
  display: 'grid',
  marginTop: '4px',
});

interface CodeLineProps {
  readonly children: ReactNode;
  readonly displayInline?: boolean;
  readonly highlight?: boolean;
  readonly result?: Result;
  readonly syntaxError?: ComponentProps<typeof CodeError>;
}

export const CodeLine = ({
  children,
  displayInline = false,
  highlight = false,
  result,
  syntaxError,
}: CodeLineProps): ReturnType<React.FC> => {
  const hasResult = result != null;
  const hasTypeError = result != null && result.type.kind === 'type-error';
  const hasSyntaxError = syntaxError != null;
  const hasError = hasSyntaxError || hasTypeError;

  const isTableOrColumn = isTabularType(result?.type);

  const renderExpandedResult = !hasError && hasResult && isTableOrColumn;

  const renderInlineResult =
    hasTypeError || (hasResult && displayInline && !renderExpandedResult);

  return (
    <div css={spacingStyles} spellCheck={false}>
      <div css={[codeLineStyles, highlight && highlightedLineStyles]}>
        <code css={codeStyles}>{children}</code>
        <div css={inlineStyles} contentEditable={false}>
          {renderInlineResult &&
            !hasSyntaxError &&
            result && ( // The typescript gods demand me to this
              <output css={inlineResultStyles}>
                <CodeResult {...result} variant="inline" />
              </output>
            )}
          {syntaxError && ( // The typescript gods punish me for using hasSyntaxError here
            <div css={inlineResultStyles}>
              <CodeError {...syntaxError} />
            </div>
          )}
        </div>
        {renderExpandedResult && result && (
          <output css={expandedResultStyles} contentEditable={false}>
            <CodeResult {...result} variant="block" />
          </output>
        )}
      </div>
    </div>
  );
};
