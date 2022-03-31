import { Computer } from '@decipad/language';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { Node } from 'slate';
import Fraction from '@decipad/fraction';
import { expressionFromEditorNodes } from '.';

it('turns an editor node into an expression', () => {
  expect(
    expressionFromEditorNodes(new Computer(), [
      { type: ELEMENT_CODE_LINE, children: [{ text: '123 bananas' }] } as Node,
    ])
  ).toMatchObject({
    error: undefined,
    expression: {
      type: 'function-call',
      args: [
        {
          type: 'funcref',
          args: ['*'],
        },
        {
          type: 'argument-list',
          args: [
            {
              type: 'literal',
              args: ['number', new Fraction(123)],
            },
            {
              type: 'ref',
              args: ['bananas'],
            },
          ],
        },
      ],
    },
    source: '123 bananas',
  });
});
