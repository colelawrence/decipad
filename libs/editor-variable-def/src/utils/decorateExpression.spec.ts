import { ELEMENT_EXPRESSION } from '@decipad/editor-types';
import { Computer } from '@decipad/language';
import { PlateEditor, WithPlatePlugin } from '@udecode/plate';
import { decorateExpression } from './decorateExpression';

it('decorates code line', () => {
  const node = {
    type: ELEMENT_EXPRESSION,
    children: [
      {
        text: '123 bananas',
      },
    ],
  };
  const path = [0];
  expect(
    decorateExpression(new Computer())(
      {} as unknown as PlateEditor,
      {} as unknown as WithPlatePlugin
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
