import {
  CodeLineElement,
  DECORATE_AUTO_COMPLETE_MENU,
  DECORATE_CODE_VARIABLE,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  MyEditor,
  MyValue,
} from '@decipad/editor-types';
import { getOnly } from '@decipad/utils';
import { createPlateEditor, getSelectionText } from '@udecode/plate';
import { BaseEditor, NodeEntry, Path } from 'slate';
import { decorateCode } from './decorateCode';
import { insertNodes } from './insertNodes';

let editor: MyEditor = createPlateEditor({});
let codeLine: CodeLineElement;
beforeEach(() => {
  editor = createPlateEditor();
});

const testDecorate = (text: string, override: Partial<BaseEditor> = {}) => {
  codeLine = {
    type: ELEMENT_CODE_LINE,
    id: 'codeline',
    children: [{ text }],
  };
  insertNodes(editor, [
    { type: ELEMENT_H1, id: 'h1', children: [{ text: '' }] },
    codeLine,
  ] as MyValue);

  Object.assign(editor, override);

  const e: NodeEntry<CodeLineElement> = [codeLine, [1]];
  return decorateCode('code_line')(editor, null as never)(e);
};

const mkCursor = (path: Path, offset = 0) => ({
  anchor: { offset, path: [...path] },
  focus: { offset, path: [...path] },
});

describe('finds what might be variable references', () => {
  const testCodeVars = (...args: Parameters<typeof testDecorate>) => {
    const items =
      testDecorate(...args)?.filter(
        (thing) => DECORATE_CODE_VARIABLE in thing
      ) ?? [];

    return items?.map((item) => {
      editor.selection = item;
      return getSelectionText(editor);
    });
  };

  it('finds variables', () => {
    const place = testCodeVars('var');

    expect(place).toMatchInlineSnapshot(`
      Array [
        "var",
      ]
    `);
  });

  it('finds local', () => {
    const place = testCodeVars('f(x) = x * 2');

    expect(place).toMatchInlineSnapshot(`
      Array [
        "x",
        "x",
      ]
    `);
  });
});

describe('inserts autocomplete where appropriate', () => {
  const testAutocomplete = (...args: Parameters<typeof testDecorate>) => {
    const items = testDecorate(...args)?.filter(
      (thing) => DECORATE_AUTO_COMPLETE_MENU in thing
    );

    return items?.length ? getOnly(items).anchor : null;
  };

  it('finds where autocomplete should go', () => {
    const place = testAutocomplete('var', {
      selection: mkCursor([1, 0], 3),
    });

    expect(place).toMatchInlineSnapshot(`
      Object {
        "offset": 0,
        "path": Array [
          1,
          0,
        ],
      }
    `);
  });

  it('finds where autocomplete should go (2)', () => {
    const place = testAutocomplete('var + 1', {
      selection: mkCursor([1, 0], 3),
    });

    expect(place).toMatchInlineSnapshot(`
      Object {
        "offset": 0,
        "path": Array [
          1,
          0,
        ],
      }
    `);
  });

  it('hides when next word already a character for a variable', () => {
    const ranges = testAutocomplete('varr', {
      selection: mkCursor([1, 0], 3),
    });

    expect(ranges).toMatchInlineSnapshot(`null`);
  });

  it('hides when its an assignment', () => {
    const ranges = testAutocomplete('var =', {
      selection: mkCursor([1, 0], 3),
    });

    expect(ranges).toMatchInlineSnapshot(`null`);
  });
});
