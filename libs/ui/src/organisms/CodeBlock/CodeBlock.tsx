import { Children, FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { InlineCodeResult } from '..';
import { Result as BlockCodeResult } from '../../lib/Editor/Blocks/Result/Result.component';
import { code, cssVar, grey200, transparency } from '../../primitives';
import { Statement } from '../../lib/results';
import { CodeError } from '../../atoms';

const codeBlockStyles = css(code, {
  backgroundColor: transparency(grey200, 0.08).rgba,

  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '16px',

  padding: '14px 12px',
  margin: '16px 0',
});

function getGridStyles(rows: number) {
  return css({
    display: 'grid',
    gridAutoFlow: 'column',
    gridGap: '0 5%',
    gridTemplateColumns: '70% 25%',
    gridTemplateRows: `repeat(${rows}, min-content)`,
  });
}

interface SyntaxError {
  line: number;
  message: string;
  url: string;
}

interface CodeBlockProps {
  readonly blockId?: string;
  readonly statements?: Statement[];
  readonly children?: ReactNode;
  readonly error?: SyntaxError;
}

export const CodeBlock = ({
  blockId,
  statements = [],
  children,
  error,
}: CodeBlockProps): ReturnType<FC> => {
  const rows = Children.count(children);
  return (
    <div>
      <div spellCheck={false}>
        <pre css={[codeBlockStyles, getGridStyles(rows)]}>
          {children}
          {error != null && (
            <Result align="end" startLine={1} endLine={error.line}>
              <CodeError {...error} />
            </Result>
          )}
          {statements.map(
            ({ displayInline, endLine, result, startLine }, index) => (
              <Result key={index} startLine={startLine} endLine={endLine}>
                {displayInline && <InlineCodeResult {...result} />}
              </Result>
            )
          )}
        </pre>
      </div>
      {blockId != null && <BlockCodeResult blockId={blockId} />}
    </div>
  );
};

const resultStyles = css({
  justifySelf: 'end',
  maxWidth: '100%', // guarantees cell contents don't bleed.
});

function getLineStyles(startRow: number, endRow: number) {
  return css({
    gridRow: `${startRow} / ${endRow}`,
  });
}

function getAlignStyles(align: 'start' | 'end') {
  return css({
    alignSelf: align,
  });
}

const Result = ({
  align = 'start',
  children,
  endLine,
  startLine,
}: {
  align?: 'start' | 'end';
  children?: React.ReactNode;
  endLine?: number;
  startLine?: number;
}): ReturnType<FC> => (
  <div
    css={[
      resultStyles,
      startLine != null && endLine != null && getLineStyles(startLine, endLine),
      getAlignStyles(align),
    ]}
    contentEditable={false}
  >
    {children}
  </div>
);
