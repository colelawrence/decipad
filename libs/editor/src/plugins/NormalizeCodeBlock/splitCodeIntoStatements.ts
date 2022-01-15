import { tokenize, STATEMENT_SEP_TOKEN_TYPE } from '@decipad/language';

export function splitCodeIntoStatements(code: string): string[] {
  let pending: string[] = [];
  const resultStatements = tokenize(code).reduce<string[]>(
    (statements, token) => {
      pending.push(token.text);
      if (token.type === STATEMENT_SEP_TOKEN_TYPE) {
        let statement = pending.join('');
        if (statement.endsWith('\n')) {
          statement = statement.substring(0, statement.length - 1);
        }
        statements.push(statement);
        pending = [];
      }
      return statements;
    },
    []
  );

  if (pending.length) {
    resultStatements.push(pending.join(''));
  }
  return resultStatements; // remove empty statements
}
