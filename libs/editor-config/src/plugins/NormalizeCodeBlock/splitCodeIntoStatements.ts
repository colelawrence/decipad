import { tokenize, STATEMENT_SEP_TOKEN_TYPE } from '@decipad/language';

function splitSeparationTokenText(text: string): [string, string] {
  let hadNewLine = false;
  const before = [];
  const after = [];
  for (const c of text) {
    if (c === '\n' && !hadNewLine) {
      hadNewLine = true;
    } else if (hadNewLine) {
      after.push(c);
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
        let rest: string = token.text;
        do {
          const beforeAndAfter = splitSeparationTokenText(rest);
          const beginning = beforeAndAfter[0];
          [, rest] = beforeAndAfter;
          pending.push(beginning);
          const statement = pending.join('');
          statements.push(statement);
          pending = [];
        } while (rest.length > 0);
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
  return resultStatements;
}
