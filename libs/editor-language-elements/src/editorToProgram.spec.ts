import {
  ColumnsElement,
  InlineNumberElement,
  MyEditor,
  ParagraphElement,
  TableElement,
  TableCaptionElement,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TR,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_INLINE_NUMBER,
  ELEMENT_BUBBLE,
  ELEMENT_CODE_LINE,
  BubbleElement,
  ELEMENT_VARIABLE_DEF,
  VariableDefinitionElement,
  CodeLineElement,
} from '@decipad/editor-types';
import { Computer, prettyPrintAST, Program } from '@decipad/computer';
import { createPlateEditor } from '@udecode/plate';
import { getOnly } from '@decipad/utils';
import { editorToProgram } from './editorToProgram';

describe('editorToProgram', () => {
  it('creates a program out of an editor', async () => {
    const editor = createPlateEditor() as MyEditor;
    editor.children = [
      { type: 'h1', id: '1', children: [{ text: '' }] },
      {
        type: ELEMENT_CODE_LINE,
        id: 'line',
        children: [{ text: '1 + 1' }],
      } as CodeLineElement,
      mkVariableDef('input', 'varName', '123'),
      {
        type: 'columns',
        id: 'columns',
        children: [
          mkVariableDef('columns/1', 'a', '12.34'),
          mkVariableDef('columns/2', 'b', '45.67'),
        ],
      } as ColumnsElement,
      {
        type: ELEMENT_PARAGRAPH,
        id: 'paragraph',
        children: [{ text: 'x' }, { text: '1 + 1', magicnumberz: true }],
      } as ParagraphElement,
      {
        type: ELEMENT_TABLE,
        id: 'table',
        children: [
          {
            type: ELEMENT_TABLE_CAPTION,
            id: 'table-caption',
            children: [
              {
                type: ELEMENT_TABLE_VARIABLE_NAME,
                id: 'table-varname',
                children: [{ text: 'TableName' }],
              },
            ],
          } as TableCaptionElement,
          {
            type: ELEMENT_TR,
            id: 'header-row',
            children: [
              {
                type: ELEMENT_TH,
                id: 'th',
                cellType: { kind: 'string' },
                children: [{ text: 'ColName' }],
              },
            ],
          },
          {
            type: ELEMENT_TR,
            id: 'tr',
            children: [
              { type: ELEMENT_TD, id: 'td', children: [{ text: 'CellData' }] },
            ],
          },
        ],
      } as TableElement,
    ];
    const { program } = await editorToProgram(editor, new Computer());

    expect(program.length).toBe(7);

    const [block, input, col1, col2, magicNum, table] = prettyPrintAll(program);

    expect(block).toMatchInlineSnapshot(`"(+ 1 1)"`);

    expect(input).toMatchInlineSnapshot(`
      "(assign
        (def varName)
        123)"
    `);

    expect(col1).toMatchInlineSnapshot(`
      "(assign
        (def a)
        12.34)"
    `);

    expect(col2).toMatchInlineSnapshot(`
      "(assign
        (def b)
        45.67)"
    `);

    expect(magicNum).toMatchInlineSnapshot(`"(+ 1 1)"`);

    expect(table).toMatchInlineSnapshot(`
      "(assign
        (def TableName)
        (table
          ColName (column \\"CellData\\")))"
    `);
  });

  it('works with bubbles', async () => {
    const editor = createPlateEditor() as MyEditor;
    editor.children = [
      { type: 'h1', id: '1', children: [{ text: '' }] },
      {
        id: 'xqab',
        type: ELEMENT_INLINE_NUMBER,
        name: 'inlineNumber',
        children: [
          {
            text: '2 apples',
          },
        ],
      } as InlineNumberElement,
      {
        id: 'xqab2',
        type: ELEMENT_INLINE_NUMBER,
        name: '',
        children: [
          {
            text: '123 + 4',
          },
        ],
      } as InlineNumberElement,
      {
        id: 'dcaqx',
        type: ELEMENT_BUBBLE,
        formula: {
          name: 'inlineBubble',
          expression: '2 + 2',
        },
        opened: false,
        children: [{ text: '' }],
      } as BubbleElement,
    ];

    const { program } = await editorToProgram(editor, new Computer());

    expect(program.length).toBe(3);

    const [inlineNumber, inlineNumber2, inlineBubble] = prettyPrintAll(program);

    expect(inlineNumber).toMatchInlineSnapshot(`
      "(assign
        (def inlineNumber)
        (implicit* 2 (ref apples)))"
    `);

    expect(inlineNumber2).toMatchInlineSnapshot(`"(+ 123 4)"`);

    expect(inlineBubble).toMatchInlineSnapshot(`
      "(assign
        (def inlineBubble)
        (+ 2 2))"
    `);
  });
});

function prettyPrintAll(program: Program): string[] {
  return program.map((block) => {
    if (block.type === 'unparsed-block') {
      throw new Error('no unparsed blocks');
    } else {
      const onlyStatement = getOnly(block.block.args);
      return prettyPrintAST(onlyStatement);
    }
  });
}

function mkVariableDef(
  id: string,
  varName = '',
  exp = ''
): VariableDefinitionElement {
  return {
    type: ELEMENT_VARIABLE_DEF,
    id,
    variant: 'expression',
    children: [
      {
        type: 'caption',
        color: '',
        icon: '',
        id: `${id}/caption`,
        children: [{ text: varName }],
      },
      {
        type: 'exp',
        id: `${id}/expression`,
        children: [{ text: exp }],
      },
    ],
  };
}
