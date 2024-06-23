/* eslint decipad/css-prop-named-variable: 0 */
import { AnyElement } from '@decipad/editor-types';
import {
  useEditorStylesContext,
  useThemeFromStore,
} from '@decipad/react-contexts';
import { useDelayedValue } from '@decipad/react-utils';
import type { Result } from '@decipad/language-interfaces';
import { css } from '@emotion/react';
import type { DragEvent, FC } from 'react';
import React, {
  ComponentProps,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { CodeResult } from '../CodeResult/CodeResult';
import { CodeError } from '../CodeError/CodeError';
import {
  antiwiggle,
  code,
  cssVar,
  p14Medium,
  p14Regular,
  smallScreenQuery,
  transparency,
  wiggle,
} from '../../../primitives';
import { codeBlock } from '../../../styles';
import { resultBubbleStyles } from '../../../styles/results';
import { deciInsideNotebookOverflowXStyles } from '../../../styles/scrollbars';
import {
  innerTablesNoBottomBorderStyles,
  innerTablesNoTopBorderStyles,
} from '../../../styles/table';
import { CodeResultProps } from '../../../types';
import {
  AvailableSwatchColor,
  TableStyleContext,
  isTabularType,
} from '../../../utils';
import { bubbleColors } from '../../../utils/bubbleColors';

const { lineHeight } = codeBlock;

const formulaDrawerHighlightLineStyles = css({
  borderColor: 'revert',
  borderRadius: 0,
});

const codeLineStyles = (
  variant: CodeLineProps['variant'],
  hasNext?: boolean,
  hasPrevious?: boolean
) =>
  css({
    ...(variant === 'standalone'
      ? {
          borderTop: `1px solid ${cssVar('borderSubdued')}`,
          borderLeft: `1px solid ${cssVar('borderSubdued')}`,
          borderRight: `1px solid ${cssVar('borderSubdued')}`,

          backgroundColor: cssVar('backgroundMain'),
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
    ...(!hasNext && variant === 'standalone'
      ? {
          borderBottom: `1px solid ${cssVar('borderSubdued')}`,
        }
      : {}),
    position: 'relative',

    ...(variant === 'standalone'
      ? {
          display: 'grid',
          // `minmax(0, X)` prevents a grid blowout when code line is made out of huge consecutive text.
          gridTemplate: `
  "code            inline-res  " 1fr
  "expanded-res    expanded-res" auto
  /minmax(0, 100%) 1fr
`,
        }
      : {
          display: 'grid',
          gridGap: '0 16px',
          gridTemplateAreas: `"code inline-res"`,
          gridTemplateColumns: 'minmax(0, 90%) 1fr',
        }),
  });

const inlineStyles = css({
  gridArea: 'inline-res',
  maxWidth: '100%',
  display: 'flex',
  justifySelf: 'end',
  alignSelf: 'flex-start',
  padding: '5px 0',

  userSelect: 'all',

  [smallScreenQuery]: {
    // When in mobile, the inline result, if there is one,  will occupy the space dedicated to
    // expanded results (i.e. tables, lists, etc.).
    gridArea: 'expanded-res',
    width: '100%',
  },
});

const codeStyles = css(code, {
  gridArea: 'code',

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

const inlineResultStyles = (bubble: boolean) =>
  css(p14Regular, bubble && resultBubbleStyles, {
    ':empty': { display: 'none' },

    textOverflow: 'ellipsis',
    padding: '2px 8px',

    ...(!bubble && {
      paddingTop: '4px',
      display: 'flex',
      alignItems: 'center',
    }),

    [smallScreenQuery]: {
      width: '100%',
    },
  });

const expandedResultStyles = css(p14Medium, {
  gridArea: 'expanded-res',
  display: 'grid',
  marginTop: '4px',
  ...deciInsideNotebookOverflowXStyles,
  'td table': {
    ...innerTablesNoTopBorderStyles,
    ...innerTablesNoBottomBorderStyles,
  },
});

const canGrabStyles = css({
  cursor: 'grab',

  ':hover': {
    animation: `${antiwiggle} 0.5s ease-in-out`,
  },

  ':hover:after': {
    backgroundColor: 'blue',
    animation: `${wiggle} 0.5s ease-in-out`,
  },
});

const grabbingStyles = css({
  cursor: 'grabbing',
});

interface CodeLineProps {
  readonly variant?: 'table' | 'standalone' | 'inline';
  readonly children: ReactNode;
  readonly highlight?: boolean;
  readonly placeholder?: string;
  readonly result?: Result.AnyResult;
  readonly syntaxError?: ComponentProps<typeof CodeError>;
  readonly isEmpty?: boolean;
  readonly onDragStartInlineResult?: (e: React.DragEvent) => void;
  readonly onDragStartCell?: CodeResultProps<'table'>['onDragStartCell'];
  readonly onDragEnd?: (e: React.DragEvent) => void;
  readonly onClickedResult?: (arg0: Result.Result) => void;
  readonly hasNextSibling?: boolean;
  readonly hasPreviousSibling?: boolean;
  readonly element?: AnyElement;
}

export const CodeLine: FC<CodeLineProps> = ({
  variant = 'standalone',
  children,
  highlight = false,
  result,
  placeholder,
  syntaxError,
  isEmpty = false,
  onDragStartInlineResult,
  onDragStartCell,
  onDragEnd,
  onClickedResult,
  hasNextSibling,
  hasPreviousSibling,
  element,
}) => {
  const [grabbing, setGrabbing] = useState(false);
  // refactor before merge
  const { color: tableColor } = useContext(TableStyleContext);
  const { color: defaultColor } = useEditorStylesContext();
  const color = tableColor || defaultColor;
  const [isDarkTheme] = useThemeFromStore();
  const { backgroundColor } = bubbleColors({
    color: color as AvailableSwatchColor,
    isDarkTheme,
    variant: 'highlighted',
  });

  const freshResult = useResultInfo({
    result,
    syntaxError,
    onDragStartCell,
    onClickedResult,
    element,
  });
  const { inline, expanded } = useDelayedValue(
    freshResult,
    freshResult.errored === true
  );

  const onDragStart = useCallback(
    (e: DragEvent) => {
      onDragStartInlineResult?.(e);
      setGrabbing(true);
    },
    [onDragStartInlineResult]
  );

  const onLocalDragEnd = useCallback(
    (e: DragEvent) => {
      onDragEnd?.(e);
      setGrabbing(false);
    },
    [onDragEnd]
  );

  return (
    <div
      className={'block-code'}
      css={[
        codeLineStyles(variant, hasNextSibling, hasPreviousSibling),
        variant === 'table' && highlight && formulaDrawerHighlightLineStyles,
        highlight && {
          backgroundColor: transparency(backgroundColor, 0.16).rgba,
        },
      ]}
      spellCheck={false}
      data-testid="code-line"
    >
      <code css={codeStyles}>{children}</code>
      {placeholder && isEmpty && (
        <span css={placeholderStyles} contentEditable={false}>
          {placeholder}
        </span>
      )}
      {!isEmpty && (
        <div
          css={[
            inlineStyles,
            (onDragStartInlineResult || onDragStartCell || onClickedResult) &&
              canGrabStyles,
            grabbing && grabbingStyles,
          ]}
          contentEditable={false}
          draggable
          onDragStart={onDragStart}
          onDragEnd={onLocalDragEnd}
        >
          {inline}
        </div>
      )}
      {!isEmpty && expanded}
    </div>
  );
};

export function useResultInfo({
  variant,
  result,
  syntaxError,
  onDragStartCell,
  onDragEnd,
  onClickedResult,
  element,
}: Pick<
  CodeLineProps,
  | 'variant'
  | 'result'
  | 'syntaxError'
  | 'onDragStartCell'
  | 'onDragEnd'
  | 'onClickedResult'
  | 'element'
>): { inline?: ReactNode; expanded?: ReactNode; errored?: boolean } {
  const onOutputClick = useCallback(() => {
    if (onClickedResult && result) {
      onClickedResult(result);
    }
  }, [onClickedResult, result]);
  //
  // Return early when syntax errors
  if (syntaxError) {
    if (syntaxError.isEmptyExpressionError) {
      return {
        inline: (
          <output css={inlineResultStyles(variant !== 'inline')}>
            <CodeError {...syntaxError} message="There is an empty variable" />
          </output>
        ),
        errored: true,
      };
    }
    return {
      inline: (
        <output css={inlineResultStyles(variant !== 'inline')}>
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
            onDragEnd={onDragEnd}
            element={element}
          />
        </output>
      ),
    };
  }

  // Any other result
  return {
    inline: (
      <output
        css={inlineResultStyles(variant !== 'inline')}
        onClick={onOutputClick}
      >
        <CodeResult {...result} variant="inline" element={element} />
      </output>
    ),
    errored: result.type.kind === 'type-error',
  };
}
