import {
  DATA_TAB_INDEX,
  DataTabChildrenElement,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_STRUCTURED_VARNAME,
  RootEditor,
} from '@decipad/editor-types';
import { generatedNames } from '@decipad/utils';
import { nanoid } from 'nanoid';

/**
 * Used when we need a smart ref to refer to the result of an expression. A new
 * variable is added to the data tab with a random name. Returns the ID of the
 * new variable.
 */

export interface ConvertExpressionToSmartRefOptions {
  expression: string;
  variableName?: string;
  idGenerator?: () => string;
}

export const convertExpressionToSmartRef = (
  editor: RootEditor,
  {
    expression,
    variableName,
    idGenerator = nanoid,
  }: ConvertExpressionToSmartRefOptions
): string => {
  const id = idGenerator();
  const name = variableName ?? generatedNames();

  editor.apply({
    type: 'insert_node',
    path: [DATA_TAB_INDEX, 0],
    node: {
      type: ELEMENT_DATA_TAB_CHILDREN,
      id,
      children: [
        {
          id: idGenerator(),
          type: ELEMENT_STRUCTURED_VARNAME,
          children: [{ text: name }],
        },
        {
          id: idGenerator(),
          type: ELEMENT_CODE_LINE_V2_CODE,
          children: [{ text: expression }],
        },
      ],
    } satisfies DataTabChildrenElement,
  });

  return id;
};
