import { AST, parseBlock } from '@decipad/remote-computer';
import { CodeResult, SplitCodeResult } from '../types';

const getOneCodeResult = (
  statement: AST.Statement,
  allCode: string,
  start: number,
  end: number
): CodeResult => {
  const statementCode = allCode.slice(start, end);
  switch (statement.type) {
    case 'assign':
    case 'function-definition':
    case 'table-column-assign':
    case 'table':
    case 'matrix-assign':
    case 'categories': {
      const [varname, ...expression] = statementCode.split('=');
      return {
        type: 'assignment',
        varname,
        value: expression.join('='),
      };
    }
  }
  return {
    type: 'expression',
    expressionCode: statementCode.trim(),
  };
};

export const splitCodeUsingGrammar = (code: string): SplitCodeResult => {
  const block = parseBlock(code);

  const { error } = block;
  if (error) {
    return {
      error: error.message,
      errorLocation: {
        line: error.line,
        column: error.column,
      },
    };
  }
  return {
    error: undefined,
    blocks: block.solution.args.flatMap((statement) => {
      if (!statement.start || !statement.end) {
        return [];
      }
      return [
        getOneCodeResult(
          statement,
          code,
          statement.start.char,
          statement.end.char + 1
        ),
      ];
    }),
  };
};
