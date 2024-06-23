import type { CodeLineElement, MyElement } from '@decipad/editor-types';
import { ELEMENT_CODE_LINE, ELEMENT_SMART_REF } from '@decipad/editor-types';
import { findTextBeforeAndAfterPoint } from './onDropSmartRef';

const testText = (text: string) => ({ text });
const testElm = <T extends string, E extends Extract<MyElement, { type: T }>>(
  id: string,
  type: T,
  children: E['children']
) => ({
  id,
  type,
  children,
});

it('can get the text before or after a selection', () => {
  const codeLine: CodeLineElement = testElm('1', ELEMENT_CODE_LINE, [
    testText(''),
  ]);

  expect(findTextBeforeAndAfterPoint(codeLine, [], { path: [0], offset: 0 }))
    .toMatchInlineSnapshot(`
      {
        "textAfter": "",
        "textBefore": "",
      }
    `);

  codeLine.children = [
    testText('hey '),
    {
      ...testElm('2', ELEMENT_SMART_REF, [testText('')]),
      blockId: 'blockid',
      columnId: '',
    },
    testText(''),
  ];
  expect(findTextBeforeAndAfterPoint(codeLine, [], { path: [0], offset: 0 }))
    .toMatchInlineSnapshot(`
      {
        "textAfter": "hey smartrefplaceholder",
        "textBefore": "",
      }
    `);
  expect(findTextBeforeAndAfterPoint(codeLine, [], { path: [0], offset: 4 }))
    .toMatchInlineSnapshot(`
      {
        "textAfter": "smartrefplaceholder",
        "textBefore": "hey ",
      }
    `);
  expect(findTextBeforeAndAfterPoint(codeLine, [], { path: [1], offset: 0 }))
    .toMatchInlineSnapshot(`
      {
        "textAfter": "smartrefplaceholder",
        "textBefore": "hey ",
      }
    `);
  expect(findTextBeforeAndAfterPoint(codeLine, [], { path: [2], offset: 0 }))
    .toMatchInlineSnapshot(`
      {
        "textAfter": "",
        "textBefore": "hey smartrefplaceholder",
      }
    `);
});
