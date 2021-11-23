import { Children, FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { AST, IdentifiedResult } from '@decipad/language';
import { InlineCodeResult } from '..';
import { Result as BlockCodeResult } from '../../lib/Editor/Blocks/Result/Result.component';
import { code, cssVar, grey200, transparency } from '../../primitives';
import { SlateElementProps } from '../../utils';

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

interface CodeBlockProps extends SlateElementProps {
  readonly block?: IdentifiedResult;
  readonly children?: ReactNode;
  readonly getStatement?: (statementIndex: number) => AST.Statement | null;
}

export const CodeBlock = ({
  block,
  children,
  getStatement = () => null,
  slateAttrs,
}: CodeBlockProps): ReturnType<FC> => {
  const rows = Children.count(children);

  return (
    <div>
      <div spellCheck={false}>
        <pre css={[codeBlockStyles, getGridStyles(rows)]} {...slateAttrs}>
          {children}
          {block != null &&
            block.results.map(({ statementIndex, value, valueType }) => {
              const statement = getStatement(statementIndex);
              return (
                <Result
                  key={statementIndex}
                  startLine={statement?.start?.line}
                  endLine={statement?.end?.line}
                >
                  <InlineCodeResult
                    statement={statement}
                    value={value}
                    type={valueType}
                  />
                </Result>
              );
            })}
        </pre>
      </div>
      {block != null && <BlockCodeResult blockId={block.blockId} />}
    </div>
  );
};

const resultStyles = css({
  justifySelf: 'end',
  maxWidth: '100%', // guarantees cell contents don't bleed.
});

function getResultLineStyles(startRow: number, endRow: number) {
  return css({
    gridRow: `${startRow} / ${endRow}`,
  });
}

const Result = ({
  children,
  endLine,
  startLine,
}: {
  children?: React.ReactNode;
  endLine?: number;
  startLine?: number;
}): ReturnType<FC> => (
  <div
    css={[
      resultStyles,
      startLine != null &&
        endLine != null &&
        getResultLineStyles(startLine, endLine),
    ]}
    contentEditable={false}
  >
    {children}
  </div>
);
