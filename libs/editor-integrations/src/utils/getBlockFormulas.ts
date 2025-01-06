import { IntegrationTypes } from '@decipad/editor-types';

export const getBlockFormulas = (
  block: IntegrationTypes.IntegrationBlock | undefined
) => {
  if (block == null) {
    return [];
  }

  const [, ...formulaChildren] = block.children;

  return formulaChildren
    .map((f, i) => [f.varName, i + 1])
    .filter((varName): varName is [string, number] => varName[0] != null);
};
