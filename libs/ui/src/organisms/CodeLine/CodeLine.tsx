import { Result } from '@decipad/computer';
import { css } from '@emotion/react';
import React, { ComponentProps, ReactNode, useState } from 'react';
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
import { isTabularType, isNodeEmpty } from '../../utils';
import { CodeResultProps } from '../../types';
import { variableStyles } from '../../styles/code-block';

const { lineHeight } = codeBlock;

const spacingStyles = (variant: CodeLineProps['variant']) =>
  css({
    paddingTop:
      variant === 'standalone' ? blockAlignment.codeLine.paddingTop : undefined,
  });

const highlightedLineStyles = {
  borderColor: cssVar('strongerHighlightColor'),
};

const codeLineStyles = (variant: CodeLineProps['variant']) =>
  css({
    ...(variant === 'standalone'
      ? {
          border: `1px solid ${cssVar('strongHighlightColor')}`,
          borderRadius: '10px',
          backgroundColor: cssVar('highlightColor'),
          padding: '4px 10px',
        }
      : {
          padding: '0px 10px',
        }),

    ':hover': highlightedLineStyles,
    position: 'relative',

    ...(variant === 'standalone'
      ? {
          display: 'grid',
          gridGap: '0 5%',
          // `minmax(0, 70%)` prevents a grid blowout when code line is made out of huge consecutive text.
          gridTemplate: `
    "code            inline-res  " 1fr
    "expanded-res    expanded-res" auto
    /minmax(0, 70%)  25%
  `,
        }
      : {}),
  });

const inlineStyles = css({
  gridArea: 'inline-res',

  maxWidth: '100%',
  display: 'flex',
  justifySelf: 'end',
  alignSelf: 'center',

  userSelect: 'all',
  cursor: 'grab',
});

const codeStyles = (variant: CodeLineProps['variant']) =>
  css(code, {
    gridArea: 'code',
    padding: variant === 'standalone' ? '3px 0' : undefined,
    ...setCssVar('currentTextColor', cssVar('strongTextColor')),
    lineHeight,
    whiteSpace: 'pre-wrap',
  });

const placeholderStyles = css(codeStyles('standalone'), {
  opacity: 0.4,
  pointerEvents: 'none',
});

const tipsStyles = css(variableStyles, {
  position: 'absolute',
  bottom: 0,
  left: 0,
  transform: 'translate(2px, 100%)',
  paddingLeft: '8px',
  paddingRight: '8px',
  borderRadius: '6px',
  color: cssVar('weakTextColor'),
  backgroundColor: 'transparent',
  pointerEvents: 'none',
  userSelect: 'none',
});

const inlineResultStyles = css(p14Regular, {
  ':empty': { display: 'none' },

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
  overflowX: 'auto',
});

const grabbingStyles = css({
  cursor: 'grabbing',
});

interface CodeLineProps {
  readonly variant?: 'table' | 'standalone';
  readonly children: ReactNode;
  readonly highlight?: boolean;
  readonly tip?: string;
  readonly placeholder?: string;
  readonly result?: Result.Result;
  readonly syntaxError?: ComponentProps<typeof CodeError>;
  readonly onDragStartInlineResult?: (e: React.DragEvent) => void;
  readonly onDragStartCell?: CodeResultProps<'table'>['onDragStartCell'];
  readonly onClickedResult?: () => void;
}

export const CodeLine = ({
  variant = 'standalone',
  children,
  highlight = false,
  result,
  tip,
  placeholder,
  syntaxError,
  onDragStartInlineResult,
  onDragStartCell,
  onClickedResult,
}: CodeLineProps): ReturnType<React.FC> => {
  const [grabbing, setGrabbing] = useState(false);

  const hasResult = result != null;
  const hasTypeError = result != null && result.type.kind === 'type-error';
  const hasSyntaxError = syntaxError != null;
  const hasError = hasSyntaxError || hasTypeError;

  const isTableOrColumn = isTabularType(result?.type);
  const isEmpty = isNodeEmpty(children);

  const renderExpandedResult = !hasError && hasResult && isTableOrColumn;

  const renderInlineResult =
    hasTypeError || (hasResult && !renderExpandedResult);

  return (
    <div css={spacingStyles(variant)} spellCheck={false}>
      <div css={[codeLineStyles(variant), highlight && highlightedLineStyles]}>
        <code css={codeStyles(variant)}>{children}</code>
        {placeholder && isEmpty && (
          <span css={placeholderStyles} contentEditable={false}>
            {placeholder}
          </span>
        )}
        {tip && (
          <span css={tipsStyles} contentEditable={false}>
            {tip}
          </span>
        )}
        <div
          css={[inlineStyles, grabbing && grabbingStyles]}
          contentEditable={false}
          draggable
          onDragStart={(e) => {
            onDragStartInlineResult?.(e);
            setGrabbing(true);
          }}
          onDragEnd={() => setGrabbing(false)}
        >
          {renderInlineResult &&
            !hasSyntaxError &&
            result && ( // The typescript gods demand me to this
              <output css={inlineResultStyles} onClick={onClickedResult}>
                <CodeResult {...result} variant="inline" />
              </output>
            )}
          {syntaxError && ( // The typescript gods punish me for using hasSyntaxError here
            <output css={inlineResultStyles}>
              <CodeError {...syntaxError} />
            </output>
          )}
        </div>
        {renderExpandedResult && result && (
          <output
            contentEditable={false}
            css={expandedResultStyles}
            onClick={onClickedResult}
          >
            <CodeResult
              {...result}
              variant="block"
              onDragStartCell={onDragStartCell}
            />
          </output>
        )}
      </div>
    </div>
  );
};
