import {
  VariableDefinitionElement,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
} from '@decipad/editor-types';
import { VariableDef } from './VariableDef';

describe('VariableDef element', () => {
  it('converts variable def document element into name and expression', () => {
    expect(VariableDef.resultsInNameAndExpression).toBe(true);
    const el: VariableDefinitionElement = {
      id: 'id0',
      type: ELEMENT_VARIABLE_DEF,
      children: [
        {
          id: 'id1',
          type: ELEMENT_CAPTION,
          children: [{ text: 'varName' }],
        },
        {
          id: 'id2',
          type: ELEMENT_EXPRESSION,
          children: [{ text: 'expression' }],
        },
      ],
    };
    expect(VariableDef.getNameAndExpressionFromElement(el)).toMatchObject({
      expression: {
        type: 'ref',
        args: ['expression'],
      },
      name: 'varName',
    });
  });
});
