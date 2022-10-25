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
  smallestDesktop,
} from '../../primitives';
import { codeBlock } from '../../styles';
import { isTabularType } from '../../utils';
import { CodeResultProps } from '../../types';

const { lineHeight } = codeBlock;

const smallScreenQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const highlightedLineStyles = {
  borderColor: cssVar('strongerHighlightColor'),
};

const codeLineStyles = (
  variant: CodeLineProps['variant'],
  hasNext?: boolean,
  hasPrevious?: boolean
) =>
  css({
    ...(variant === 'standalone'
      ? {
          border: `1px solid ${cssVar('strongHighlightColor')}`,

          backgroundColor: cssVar('highlightColor'),
          padding: '6px 12px',
        }
      : {
          padding: '0px 12px',
        }),

    // Think this couldn't be done with CSS since one cannot query the next element to influence
    // the current one, as it would be needed for the effect given by `hasNext`.
    ...(!hasPrevious
      ? { borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }
      : {}),
    ...(!hasNext
      ? {
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
        }
      : {}),

    ':hover': highlightedLineStyles,
    position: 'relative',

    ...(variant === 'standalone'
      ? {
          display: 'grid',
          gridGap: '0 16px',
          // `minmax(0, X)` prevents a grid blowout when code line is made out of huge consecutive text.
          gridTemplate: `
    "code            inline-res  " 1fr
    "expanded-res    expanded-res" auto
    /minmax(0, 66%)  34%
  `,
        }
      : {}),
  });

const inlineStyles = css({
  gridArea: 'inline-res',

  maxWidth: '100%',
  display: 'flex',
  justifySelf: 'end',
  alignSelf: 'flex-start',
  padding: '5px 0',

  userSelect: 'all',
  cursor: 'grab',

  [smallScreenQuery]: {
    // When in mobile, the inline result, if there is one,  will occupy the space dedicated to
    // expanded results (i.e. tables, lists, etc.).
    gridArea: 'expanded-res',
    width: '100%',
  },
});

const codeStyles = css(code, {
  gridArea: 'code',
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  lineHeight,
  whiteSpace: 'pre-wrap',

  [smallScreenQuery]: {
    // When in mobile we want to use that extra right-space that usually belongs to inline results.
    gridArea: '1 / span 2',
  },
});

const placeholderStyles = css(codeStyles, {
  opacity: 0.4,
  pointerEvents: 'none',

  [smallScreenQuery]: {
    position: 'absolute',
    left: '12px',
  },
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

  [smallScreenQuery]: {
    width: '100%',
  },
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
  readonly isEmpty?: boolean;
  readonly onDragStartInlineResult?: (e: React.DragEvent) => void;
  readonly onDragStartCell?: CodeResultProps<'table'>['onDragStartCell'];
  readonly onClickedResult?: (arg0: Result.Result) => void;
  readonly hasNextSibling?: boolean;
  readonly hasPreviousSibling?: boolean;
}

export const CodeLine = ({
  variant = 'standalone',
  children,
  highlight = false,
  result,
  placeholder,
  syntaxError,
  isEmpty = false,
  onDragStartInlineResult,
  onDragStartCell,
  onClickedResult,
  hasNextSibling,
  hasPreviousSibling,
}: CodeLineProps): ReturnType<React.FC> => {
  const [grabbing, setGrabbing] = useState(false);

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
    <div
      css={[
        codeLineStyles(variant, hasNextSibling, hasPreviousSibling),
        highlight && highlightedLineStyles,
      ]}
      spellCheck={false}
    >
      <code css={codeStyles}>{children}</code>
      {placeholder && isEmpty && (
        <span css={placeholderStyles} contentEditable={false}>
          {placeholder}
        </span>
      )}
      {!isEmpty && (
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
      )}
      {!isEmpty && expanded}
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
