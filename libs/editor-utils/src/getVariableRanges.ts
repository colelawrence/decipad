import { Path, Range } from 'slate';
import { getUsedIdentifiers } from '@decipad/computer';

export type RangeWithVariableInfo = Range & VariableInfo;

export interface VariableInfo {
  readonly variableName: string;
  readonly blockId: string;
  readonly isDeclaration: boolean;
}

export const getVariableRanges = (
  code: string,
  path: Path,
  blockId: string
): RangeWithVariableInfo[] => {
  return getUsedIdentifiers(code).map((ident) => {
    const variableName = ident.text;
    return {
      blockId,
      anchor: { path, offset: ident.start },
      focus: { path, offset: ident.end },
      variableName,
      isDeclaration: ident.isDeclaration,
    };
  });
};
