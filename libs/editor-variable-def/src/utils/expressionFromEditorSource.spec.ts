import { toFraction } from '@decipad/fraction';
import { expressionFromEditorSource } from './expressionFromEditorSource';

it('turns an editor node into an expression', () => {
  expect(expressionFromEditorSource('123 bananas')).toMatchObject({
    error: undefined,
    expression: {
      type: 'function-call',
      args: [
        {
          type: 'funcref',
          args: ['implicit*'],
        },
        {
          type: 'argument-list',
          args: [
            {
              type: 'literal',
              args: ['number', toFraction(123)],
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
