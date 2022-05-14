import { Computer } from '@decipad/computer';
import Fraction from '@decipad/fraction';
import { expressionFromEditorSource } from './expressionFromEditorSource';

it('turns an editor node into an expression', () => {
  expect(
    expressionFromEditorSource(new Computer(), '123 bananas')
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
