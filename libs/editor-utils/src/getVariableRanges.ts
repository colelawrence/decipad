import { Path, Range } from 'slate';
import {
  Computer,
  getUsedIdentifiers,
  SerializedType,
  Result,
} from '@decipad/computer';

type RangeWithVariableInfo = Range & {
  readonly variableMissing?: boolean;
  readonly variableName?: string;
  readonly blockId?: string;
  readonly isDeclaration?: boolean;
  readonly type?: SerializedType;
  readonly value?: Result.OneResult | null;
};

export const getVariableRanges = (
  computer: Computer,
  code: string,
  path: Path,
  blockId: string
): RangeWithVariableInfo[] => {
  return getUsedIdentifiers(code).map((ident) => {
    const variableName = ident.text;
    const result = computer.getVariable(variableName);
    let type: SerializedType | undefined;
    let value: Result.OneResult | undefined;
    if (result) {
      type = result.type;
      value = result.value ?? undefined;
    }
    return {
      blockId,
      anchor: { path, offset: ident.start },
      focus: { path, offset: ident.end },
      variableName,
      isDeclaration: ident.isDeclaration,
      type,
      value,
    };
  });
};
