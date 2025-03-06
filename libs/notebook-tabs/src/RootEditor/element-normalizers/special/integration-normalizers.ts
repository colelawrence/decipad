import { assert } from '@decipad/utils';
import { Normalizer } from '../element-normalizer';
import {
  IntegrationTypes,
  TableColumnFormulaElement,
} from '@decipad/editor-types';
import { omit } from 'lodash';

const DEFAULT_NAME = 'Column';

const getUniqueName = (existingNames: Set<string>): string => {
  let numbering = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const name = `${DEFAULT_NAME}${numbering}`;
    if (!existingNames.has(name)) {
      return name;
    }

    numbering++;
  }
};

const getAllFormulaNames = (
  formulas: Array<TableColumnFormulaElement>
): Set<string> => {
  return new Set(formulas.map((f) => f.varName!));
};

export const integrationColumnNameNormalizer: Normalizer<
  IntegrationTypes.IntegrationBlock
> = ([node, path]) => {
  const columnNames = new Set<string>();

  const [, ...formulas] = node.children;

  for (const [index, formula] of formulas.entries()) {
    assert(formula.varName != null);

    if (columnNames.has(formula.varName!)) {
      return {
        type: 'set_node',
        path: [...path, index + 1],
        properties: omit(formula, 'children'),
        newProperties: {
          ...omit(formula, 'children'),
          varName: getUniqueName(getAllFormulaNames(formulas)),
        },
      };
    }

    columnNames.add(formula.varName);
  }

  return undefined;
};
