import { Result } from '@decipad/language';
import { css } from '@emotion/react';
import { ComponentProps, ReactNode } from 'react';
import { CodeError } from '../../atoms';
import { CodeResult } from '..';
import { code, cssVar, p14Regular, setCssVar } from '../../primitives';
import { codeBlock } from '../../styles';

const { lineHeight } = codeBlock;

const styles = css(code, {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),

  display: 'grid',
  gridGap: '5%',
  gridTemplateColumns: '70% 25%',

  lineHeight,
  whiteSpace: 'pre-wrap',

  ':hover': {
    background: cssVar('highlightColor'),
    borderRadius: '10px',
    boxShadow: `4px 0px 0px 0px ${cssVar(
      'highlightColor'
    )}, -4px 0px 0px 0px ${cssVar('highlightColor')}`,
  },
});

const codeStyles = css({
  // Hackish way to make slate leafs behave and wrap long pieces of code (e.g. fetch urls).
  // Can't simply use `overflowWrap: 'anywhere'` because Safari does not have support.
  '& span': {
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  },
});

const inlineResultStyles = css(p14Regular, {
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),

  justifySelf: 'end',
  maxWidth: '100%',

  lineHeight,

  // Truncates text
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

interface CodeLineProps {
  readonly children: ReactNode;
  readonly displayInline?: boolean;
  readonly result?: Result;
  readonly syntaxError?: ComponentProps<typeof CodeError>;
}

export const CodeLine = ({
  children,
  displayInline = false,
  result,
  syntaxError,
}: CodeLineProps): ReturnType<React.FC> => {
  return (
    <div css={styles}>
      <code css={codeStyles}>{children}</code>
      <output css={inlineResultStyles} contentEditable={false}>
        {!syntaxError &&
          result &&
          (displayInline || result.type.kind === 'type-error') && (
            <CodeResult {...result} variant="inline" />
          )}
        {syntaxError && <CodeError {...syntaxError} />}
      </output>
    </div>
  );
};
