import { tokenize } from '@decipad/language';

interface TokenPos {
  text: string;
  isDeclaration: boolean;
  start: number;
  end: number;
}

const endOf = (tok: moo.Token) => tok.offset + tok.text.length;

export const getUsedIdentifiers = (code: string): TokenPos[] => {
  const identifiers: TokenPos[] = [];
  const tokens = tokenize(code).filter((tok) => tok.type !== 'ws');

  for (let i = 0; i < tokens.length; i += 1) {
    const currentTok = tokens[i];
    // we only care about identifiers, and identifier.identifier
    if (currentTok.type !== 'identifier') {
      continue;
    }

    // skip function name
    if (tokens[i + 1]?.type === 'leftParen') {
      continue;
    }

    // table column or assignment to it (TableName.ColumnName)
    const identDotIdent =
      tokens[i + 1]?.type === 'dot' && tokens[i + 2]?.type === 'identifier';

    if (identDotIdent) {
      // TableName.ColumnName = ...
      identifiers.push({
        text: `${currentTok.text}.${tokens[i + 2].text}`,
        start: currentTok.offset,
        end: endOf(tokens[i + 2]),
        isDeclaration: tokens[i + 3]?.type === 'equalSign',
      });

      // Skip anyway so this doesn't get interpreted as other kinds of constructs
      i += 2;
      continue;
    }

    // variable declaration or ref
    if (currentTok.type === 'identifier') {
      identifiers.push({
        text: currentTok.text,
        start: currentTok.offset,
        end: endOf(currentTok),
        isDeclaration: tokens[i + 1]?.type === 'equalSign',
      });
      continue;
    }
  }

  return identifiers;
};
