import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { Result } from '@decipad/language';
import { code, cssVar, grey250 } from '../../primitives';
import { CodeResult } from '..';

const codeBlockStyles = css(code, {
  border: `1px solid ${grey250.rgb}`,

  borderRadius: '12px',
  overflow: 'hidden',

  margin: '16px 0',
});

const codeStyles = css(code, {
  backgroundColor: cssVar('backgroundColor'),
  padding: '4px 8px',
});

const resultStyles = css({
  backgroundColor: cssVar('highlightColor'),
  display: 'grid',
  padding: '8px',
});

interface CodeBlockProps {
  readonly blockId?: string;
  readonly expandedResult?: Result;
  readonly children?: ReactNode;
}

export const CodeBlock = ({
  children,
  expandedResult,
}: CodeBlockProps): ReturnType<FC> => {
  return (
    <div>
      <section css={codeBlockStyles} spellCheck={false}>
        <pre css={codeStyles}>{children}</pre>
        {expandedResult?.value != null && (
          <output css={resultStyles} contentEditable={false}>
            <CodeResult {...expandedResult} />
          </output>
        )}
      </section>
    </div>
  );
};
