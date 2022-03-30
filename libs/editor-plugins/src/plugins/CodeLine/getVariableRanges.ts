import { Path, Range } from 'slate';
import { getUsedIdentifiers } from '@decipad/language';
import { ComponentProps } from 'react';
import { CodeVariable } from '@decipad/editor-components';

type VariableInfo = Omit<ComponentProps<typeof CodeVariable>['leaf'], 'text'>;
type RangeWithVariableInfo = Range & VariableInfo;

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
