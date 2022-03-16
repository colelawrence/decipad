import { Path, Range } from 'slate';
import { getUsedIdentifiers } from '@decipad/language';

export const getVariableRanges = (
  code: string,
  path: Path,
  previouslyDefined: Set<string> = new Set()
): Range[] => {
  return getUsedIdentifiers(code, previouslyDefined).map((ident) => ({
    anchor: { path, offset: ident.start },
    focus: { path, offset: ident.end },
  }));
};
