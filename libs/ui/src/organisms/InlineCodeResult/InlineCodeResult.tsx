import { css } from '@emotion/react';
import { AST, InBlockResult } from '@decipad/language';
import { code, cssVar, p12Regular, setCssVar } from '../../primitives';
import { CodeResult } from '..';

const styles = css(p12Regular, {
  ...setCssVar('normalTextColor', cssVar('weakTextColor')),

  lineHeight: code.lineHeight,
  padding: '8.5px 0',

  // Truncates text
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

interface InlineCodeResultProps {
  readonly statement: AST.Statement | null;
  readonly value: InBlockResult['value'];
  readonly type: InBlockResult['valueType'];
}

export const InlineCodeResult = ({
  statement,
  value,
  type,
}: InlineCodeResultProps): ReturnType<React.FC> => {
  if (statement == null) {
    return null;
  }

  if (isLiteralValueOrAssignment(statement)) {
    return null;
  }

  return (
    <div css={styles}>
      <CodeResult value={value} variant="inline" type={type} />
    </div>
  );
};

function isLiteralValueOrAssignment(stmt: AST.Statement): boolean {
  return (
    stmt?.type === 'literal' ||
    (stmt?.type === 'assign' && stmt.args[1].type === 'literal')
  );
}
