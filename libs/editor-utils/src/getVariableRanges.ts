import { Path, Range } from 'slate';
import { getUsedIdentifiers } from '@decipad/computer';

type RangeWithVariableInfo = Range & {
  readonly variableMissing?: boolean;
  readonly variableName?: string;
  readonly blockId?: string;
  readonly isDeclaration?: boolean;
};

export const getVariableRanges = (
  code: string,
  path: Path,
  blockId: string
): RangeWithVariableInfo[] => {
  return getUsedIdentifiers(code).map((ident) => ({
    blockId,
    anchor: { path, offset: ident.start },
    focus: { path, offset: ident.end },
    variableName: ident.text,
    isDeclaration: ident.isDeclaration,
  }));
};
