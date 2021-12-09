import { Path, Range } from 'slate';
import { tokenize } from '@decipad/language';

const getAssignedIdentifiers = (code: string) =>
  tokenize(code)
    .filter((tok) => tok.type !== 'ws')
    .filter(
      (currentTok, i, all) =>
        currentTok.type === 'identifier' && all[i + 1]?.type === 'equalSign'
    );

export const getVariableRanges = (code: string, path: Path): Range[] => {
  return getAssignedIdentifiers(code).map((ident) => ({
    anchor: { path, offset: ident.offset },
    focus: { path, offset: ident.offset + ident.text.length },
  }));
};
