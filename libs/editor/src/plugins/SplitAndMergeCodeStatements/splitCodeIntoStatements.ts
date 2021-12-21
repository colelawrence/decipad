import {
  parensCountingTokenizer,
  STATEMENT_SEP_TOKEN_TYPE,
} from '@decipad/language';

export function splitCodeIntoStatements(code: string): string[] {
  let pending: string[] = [];
  const result = Array.from(parensCountingTokenizer.reset(code)).reduce<
    string[]
  >((statements, token) => {
    if (token.type === STATEMENT_SEP_TOKEN_TYPE) {
      statements.push(pending.join(''));
      pending = [];
    } else {
      pending.push(token.text);
    }
    return statements;
  }, []);

  if (pending.length) {
    result.push(pending.join(''));
  }
  return result.filter(Boolean);
}
