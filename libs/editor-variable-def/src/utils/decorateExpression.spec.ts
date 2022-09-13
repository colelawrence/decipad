import {
  ELEMENT_EXPRESSION,
  ExpressionElement,
  MyEditor,
  MyValue,
} from '@decipad/editor-types';
import { PluginOptions, WithPlatePlugin } from '@udecode/plate';
import { createEditor } from 'slate';
import { decorateExpression } from './decorateExpression';

it('decorates code line', () => {
  const node = {
    type: ELEMENT_EXPRESSION,
    children: [
      {
        text: '123 bananas',
      },
    ],
  } as ExpressionElement;
  const path = [0];
  expect(
    decorateExpression(createEditor() as MyEditor)(
      {} as unknown as MyEditor,
      {} as unknown as WithPlatePlugin<PluginOptions, MyValue>
    )([node, path])
  ).toMatchObject([
    {
      tokenType: 'number',
      anchor: {
        offset: 0,
      },
      dec_exp: true,
      focus: {
        offset: 3,
      },
    },
    {
      tokenType: 'ws',
      anchor: {
        offset: 3,
      },
      dec_exp: true,
      focus: {
        offset: 4,
      },
    },
    {
      tokenType: 'identifier',
      anchor: {
        offset: 4,
      },
      dec_exp: true,
      focus: {
        offset: 11,
      },
    },
  ]);
});
