import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { blockAlignment } from '../../styles';

const codeBlockStyles = css({
  margin: `${blockAlignment.codeBlock.paddingTop} 0`,
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
