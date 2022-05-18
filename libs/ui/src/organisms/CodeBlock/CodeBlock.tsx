import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../primitives';

const codeBlockStyles = css({
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '10px',
  backgroundColor: cssVar('highlightColor'),
});

interface CodeBlockProps {
  readonly blockId?: string;
  readonly children?: ReactNode;
}

export const CodeBlock = ({ children }: CodeBlockProps): ReturnType<FC> => {
  return (
    <div>
      <section css={codeBlockStyles} spellCheck={false}>
        <pre>{children}</pre>
      </section>
    </div>
  );
};
