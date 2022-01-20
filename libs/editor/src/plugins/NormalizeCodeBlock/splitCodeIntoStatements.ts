import { tokenize, STATEMENT_SEP_TOKEN_TYPE } from '@decipad/language';

function splitSeparationTokenText(text: string): [string, string] {
  let hadNewLine = false;
  const before = [];
  const after = [];
  for (const c of text) {
    if (hadNewLine) {
      after.push(c);
    } else if (c === '\n' && !hadNewLine) {
      hadNewLine = true;
    } else {
      before.push(c);
    }
  }
  return [before.join(''), after.join('')];
}

export function splitCodeIntoStatements(code: string): string[] {
  let pending: string[] = [];
  const resultStatements = tokenize(code).reduce<string[]>(
    (statements, token) => {
      if (token.type === STATEMENT_SEP_TOKEN_TYPE) {
        const [beginning, rest] = splitSeparationTokenText(token.text);
        pending.push(beginning);
        const statement = pending.join('');
        statements.push(statement);
        pending = [rest];
      } else {
        pending.push(token.text);
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
