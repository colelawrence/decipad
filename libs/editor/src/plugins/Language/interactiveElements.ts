import {
  ELEMENT_FETCH,
  ELEMENT_INPUT,
  ELEMENT_TABLE_INPUT,
  FetchElement,
  InputElement,
  InteractiveElement,
  TableData,
  TableElement,
} from '@decipad/editor-types';
import { AST, isExpression, parseOneBlock } from '@decipad/language';
import { astNode } from '../../utils/astNode';
import { getNullReplacementValue, parseCell } from '../../utils/parseCell';
import { getAssignmentBlock, getRefBlock } from './common';

type TransformerFn<T extends InteractiveElement> = (
  arg: T
) => OutputNode | null;

interface OutputNode {
  name: string;
  expression: AST.Expression;
}

const weakMapMemoize = <T extends InteractiveElement>(
  fn: TransformerFn<T>
): TransformerFn<T> => {
  const cache = new WeakMap<T, OutputNode | null>();

  return (arg: T) => {
    const cached = cache.get(arg) ?? fn(arg);
    cache.set(arg, cached);
    return cached;
  };
};

const getTableNode = (tableData: TableData): AST.Table => {
  const cols: AST.Table['args'] = tableData.columns.map(
    ({ columnName, cellType, cells }) => {
      const cellNodes = cells.map(
        (cell) => parseCell(cellType, cell) ?? getNullReplacementValue(cellType)
      );

      return astNode(
        'table-column',
        astNode('coldef', columnName),
        astNode('column', astNode('column-items', ...cellNodes))
      );
    }
  );

  return astNode('table', ...cols);
};

const astTransforms = {
  [ELEMENT_FETCH]: weakMapMemoize((fetchData: FetchElement) => {
    return {
      name: fetchData['data-varname'],
      expression: {
        type: 'fetch-data',
        args: [fetchData['data-href'], fetchData['data-contenttype']],
      },
    };
  }),
  [ELEMENT_INPUT]: weakMapMemoize(({ value, variableName }: InputElement) => {
    if (!variableName) return null;
    try {
      const block = parseOneBlock(value);
      if (block.args.length === 1 && isExpression(block.args[0])) {
        return { name: variableName, expression: block.args[0] };
      }
      // eslint-disable-next-line no-empty
    } catch {}

    return null;
  }),
  [ELEMENT_TABLE_INPUT]: weakMapMemoize(({ tableData }: TableElement) => {
    if (!tableData.variableName) return null;
    const expression = getTableNode(tableData);
    if (expression) {
      return { name: tableData.variableName, expression };
    }
    return null;
  }),
};

export const getAstBlockFromInteractiveElement = <T extends InteractiveElement>(
  element: T
): AST.Block | null => {
  if (!('id' in element) || element.id == null) {
    return null;
  }

  let result;
  switch (element.type) {
    case 'fetch-data':
      result = astTransforms[ELEMENT_FETCH](element);
      break;
    case 'input':
      result = astTransforms[ELEMENT_INPUT](element);
      break;
    case 'table-input':
      result = astTransforms[ELEMENT_TABLE_INPUT](element);
      break;
  }

  return (
    (result &&
      getAssignmentBlock(element.id, result.name, result.expression)) ||
    null
  );
};

export const getAstFromVarName = (
  id: string,
  sourceVarName: string
): AST.Block => {
  return getRefBlock(id, sourceVarName);
};
