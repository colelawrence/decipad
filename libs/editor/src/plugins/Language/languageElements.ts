import { AST, isExpression, parseOneBlock } from '@decipad/language';
import {
  TableElement,
  InputElement,
  ELEMENT_INPUT,
  ELEMENT_TABLE_INPUT,
  ELEMENT_FETCH,
  FetchElement,
  Node,
} from '../../elements';
import { TableData } from '../../types';
import { astNode } from '../../utils/astNode';
import { getNullReplacementValue, parseCell } from '../../utils/parseCell';
import { getAssignmentBlock } from './common';

type TransformerFn<T extends LanguageElement> = (arg: T) => OutputNode | null;

interface OutputNode {
  name: string;
  expression: AST.Expression;
}

const weakMapMemoize = <T extends LanguageElement>(
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

type LanguageElement = FetchElement | TableElement | InputElement;
type LanguageElementsKind = LanguageElement['type'];

type TransformerMap = {
  readonly [K in LanguageElementsKind]: TransformerFn<
    Extract<LanguageElement, { type: K }>
  >;
};

const astTransforms: TransformerMap = {
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

export const languageElements: LanguageElementsKind[] = [
  ELEMENT_FETCH,
  ELEMENT_INPUT,
  ELEMENT_TABLE_INPUT,
];

export const isLanguageElement = (node: Node): node is LanguageElement =>
  'type' in node && languageElements.includes(node.type);

export const getAstBlockFromLanguageElement = <T extends LanguageElement>(
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

  return result == null
    ? null
    : getAssignmentBlock(element.id, result.name, result.expression);
};
