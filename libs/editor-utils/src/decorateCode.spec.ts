import { Computer } from '@decipad/computer';
import {
  CodeLineElement,
  DECORATE_AUTO_COMPLETE_MENU,
  DECORATE_CODE_VARIABLE,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_H1,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  MyElementEntry,
  MyValue,
} from '@decipad/editor-types';
import { getDefined, getOnly } from '@decipad/utils';
import {
  createPlateEditor,
  ELEMENT_TABLE,
  findNode,
  getSelectionText,
} from '@udecode/plate';
import { NodeEntry, Path } from 'slate';
import { decorateCode, getRootNodeId } from './decorateCode';
import { insertNodes } from './insertNodes';

let editor: MyEditor = createPlateEditor({});
const computer = new Computer();
let codeLine: CodeLineElement;
beforeEach(() => {
  editor = createPlateEditor();
});

const testDecorate = (text: string, override: Partial<MyEditor> = {}) => {
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
  return decorateCode(computer, ELEMENT_CODE_LINE)(editor, null as never)(e);
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

it('finds the element containing the code. this is used to prevent a smartref referring to itself', () => {
  editor.children = [
    {
      type: ELEMENT_H1,
      id: 'h1',
      children: [{ text: '' }],
    },
    {
      type: ELEMENT_CODE_LINE,
      id: 'codeline',
      children: [{ text: 'var' }],
    },
    {
      type: ELEMENT_CODE_LINE_V2,
      id: 'codeline2',
      children: [
        {
          type: ELEMENT_STRUCTURED_VARNAME,
          id: 'codeline2varname',
          children: [{ text: 'var' }],
        },
        {
          type: ELEMENT_CODE_LINE_V2_CODE,
          id: 'codeline2code',
          children: [{ text: 'var' }],
        },
      ],
    },
    {
      type: ELEMENT_TABLE,
      id: 'table',
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          id: 'tablecaption',
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              id: 'tablevarname',
              children: [{ text: 'var' }],
            },
            {
              type: ELEMENT_TABLE_COLUMN_FORMULA,
              id: 'tablecolumnformula',
              columnId: 'columnid',
              children: [{ text: 'var' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          id: 'tr',
          children: [
            {
              type: ELEMENT_TH,
              id: 'columnid',
              children: [{ text: 'tablecolumnname' }],
              cellType: { kind: 'table-formula' },
            },
          ],
        },
        {
          type: ELEMENT_TR,
          id: 'tr',
          children: [
            {
              type: ELEMENT_TD,
              id: 'td',
              children: [
                {
                  text: 'td',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const basicCodeLine = getDefined(
    findNode(editor, {
      at: [],
      match: { id: 'codeline' },
    })
  ) as MyElementEntry;
  expect(getRootNodeId(editor, basicCodeLine)).toMatchInlineSnapshot(
    `"codeline"`
  );

  const codeLineV2 = getDefined(
    findNode(editor, {
      at: [],
      match: { id: 'codeline2code' },
    })
  ) as MyElementEntry;
  expect(getRootNodeId(editor, codeLineV2)).toMatchInlineSnapshot(
    `"codeline2"`
  );

  const tableColumnFormula = getDefined(
    findNode(editor, {
      at: [],
      match: { id: 'tablecolumnformula' },
    })
  ) as MyElementEntry;
  expect(getRootNodeId(editor, tableColumnFormula)).toMatchInlineSnapshot(
    `"columnid"`
  );
});
