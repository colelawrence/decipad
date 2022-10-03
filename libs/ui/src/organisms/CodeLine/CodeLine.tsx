import { Result } from '@decipad/computer';
import { css } from '@emotion/react';
import React, { ComponentProps, ReactNode, useState } from 'react';
import { useDelayedValue } from '@decipad/react-utils';
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
  readonly placeholder?: string;
  readonly result?: Result.Result;
  readonly syntaxError?: ComponentProps<typeof CodeError>;
  readonly onDragStartInlineResult?: (e: React.DragEvent) => void;
  readonly onDragStartCell?: CodeResultProps<'table'>['onDragStartCell'];
  readonly onClickedResult?: (arg0: Result.Result) => void;
}

export const CodeLine = ({
  variant = 'standalone',
  children,
  highlight = false,
  result,
  placeholder,
  syntaxError,
  onDragStartInlineResult,
  onDragStartCell,
  onClickedResult,
}: CodeLineProps): ReturnType<React.FC> => {
  const [grabbing, setGrabbing] = useState(false);

  const isEmpty = isNodeEmpty(children);

  const freshResult = renderPotentiallyExpandedResult({
    result,
    syntaxError,
    onDragStartCell,
    onClickedResult,
  });
  const { inline, expanded } = useDelayedValue(
    freshResult,
    freshResult.errored === true
  );

  return (
    <div css={spacingStyles(variant)} spellCheck={false}>
      <div css={[codeLineStyles(variant), highlight && highlightedLineStyles]}>
        <code css={codeStyles(variant)}>{children}</code>
        {placeholder && isEmpty && (
          <span css={placeholderStyles} contentEditable={false}>
            {placeholder}
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
          {inline}
        </div>
        {expanded}
      </div>
    </div>
  );
};

function renderPotentiallyExpandedResult({
  result,
  syntaxError,
  onDragStartCell,
  onClickedResult,
}: Pick<
  CodeLineProps,
  'result' | 'syntaxError' | 'onDragStartCell' | 'onClickedResult'
>): { inline?: ReactNode; expanded?: ReactNode; errored?: boolean } {
  // Return early when syntax errors
  if (syntaxError) {
    return {
      inline: (
        <output css={inlineResultStyles}>
          <CodeError {...syntaxError} />
        </output>
      ),
      errored: true,
    };
  }

  if (!result || result.type.kind === 'nothing') {
    return {};
  }

  // Tables are expanded
  if (isTabularType(result.type)) {
    return {
      expanded: (
        <output contentEditable={false} css={expandedResultStyles}>
          <CodeResult
            {...result}
            variant="block"
            onDragStartCell={onDragStartCell}
          />
        </output>
      ),
    };
  }

  // Any other result
  return {
    inline: (
      <output
        css={inlineResultStyles}
        onClick={() => {
          if (onClickedResult) {
            onClickedResult(result);
          }
        }}
      >
        <CodeResult {...result} variant="inline" />
      </output>
    ),
    errored: result.type.kind === 'type-error',
  };
}
