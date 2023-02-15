import { AST, Computer, prettyPrintAST } from '@decipad/computer';
import {
  CodeLineV2Element,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  createTPlateEditor,
  ELEMENT_H1,
} from '@decipad/editor-types';
import { getOnly } from '@decipad/utils';
import { parseStructuredCodeLine } from './CodeLineV2';

expect.addSnapshotSerializer({
  test: (val) => val && typeof val.type === 'string' && Array.isArray(val.args),
  print: (val) => prettyPrintAST(val as AST.Node),
});

const createTestCodeLine = (code: string) => {
  const codeLine: CodeLineV2Element = {
    type: ELEMENT_CODE_LINE_V2,
    id: 'codelineid',
    children: [
      {
        type: ELEMENT_STRUCTURED_VARNAME,
        id: 'test',
        children: [{ text: 'TestName' }],
      },
      {
        type: ELEMENT_CODE_LINE_V2_CODE,
        id: 'test',
        children: [{ text: code }],
      },
    ],
  };

  const computer = new Computer();
  const editor = createTPlateEditor();

  editor.children = [
    { id: 'h1', type: ELEMENT_H1, children: [{ text: '' }] },
    codeLine,
  ];

  return { editor, computer, codeLine };
};

it('can parse a number', async () => {
  const { editor, computer, codeLine } = createTestCodeLine('1');
  const { interpretedAs, programChunk } = await parseStructuredCodeLine(
    editor,
    computer,
    codeLine
  );
  expect(interpretedAs).toMatchInlineSnapshot(`"literal"`);
  expect(getOnly(programChunk)).toMatchInlineSnapshot(`
    Object {
      "block": (block
      (assign
        (def TestName)
        1)),
      "definesVariable": "TestName",
      "id": "codelineid",
      "type": "identified-block",
    }
  `);
});

it('can parse code', async () => {
  const { editor, computer, codeLine } = createTestCodeLine('1 meter');
  const { interpretedAs, programChunk } = await parseStructuredCodeLine(
    editor,
    computer,
    codeLine
  );
  expect(interpretedAs).toMatchInlineSnapshot(`"code"`);
  expect(getOnly(programChunk)).toMatchInlineSnapshot(`
    Object {
      "block": (block
      (assign
        (def TestName)
        (implicit* 1 (ref meter)))),
      "definesVariable": "TestName",
      "id": "codelineid",
      "type": "identified-block",
    }
  `);
});

it('can parse nothing', async () => {
  const { editor, computer, codeLine } = createTestCodeLine(' ');
  const { interpretedAs, programChunk } = await parseStructuredCodeLine(
    editor,
    computer,
    codeLine
  );
  expect(interpretedAs).toMatchInlineSnapshot(`"empty"`);
  expect(getOnly(programChunk)).toMatchInlineSnapshot(`
    Object {
      "block": (block
      (assign
        (def TestName)
        0)),
      "definesVariable": "TestName",
      "id": "codelineid",
      "type": "identified-block",
    }
  `);
});
