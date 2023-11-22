import {
  ELEMENT_CAPTION,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_EXPRESSION,
  ELEMENT_PARAGRAPH,
  ELEMENT_SLIDER,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  ELEMENT_VARIABLE_DEF,
  MyEditor,
  TableElement,
  TableRowElement,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import {
  insertEmbedBelow,
  insertImageBelow,
  requirePathBelowBlock,
} from '@decipad/editor-utils';
import { noop } from '@decipad/utils';
import {
  findNodePath,
  focusEditor,
  getNodeString,
  insertNodes,
  removeNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { insertLiveConnection } from '../InteractiveParagraph/insertLiveConnection';
import { RemoteComputer } from '@decipad/remote-computer';

export const addVariable = (args: any, editor: MyEditor) => {
  const path = editor.children.length;
  insertNodes(
    editor,
    [
      {
        id: nanoid(),
        type: ELEMENT_CODE_LINE_V2,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [
              {
                text: args.label.split(' ').join(''),
              },
            ],
          },
          {
            id: nanoid(),
            type: ELEMENT_CODE_LINE_V2_CODE,
            children: [
              {
                text: `${args.value} ${args.unit || ''}`,
              },
            ],
          },
        ],
      },
    ],
    { at: [path] }
  );
  removeNodes(editor, { at: [path - 1] });
};

export const addCalculation = (args: any, editor: MyEditor) => {
  const path = editor.children.length;
  insertNodes(
    editor,
    [
      {
        id: nanoid(),
        type: ELEMENT_CODE_LINE_V2,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [
              {
                text: args.label.split(' ').join(''),
              },
            ],
          },
          {
            id: nanoid(),
            type: ELEMENT_CODE_LINE_V2_CODE,
            children: [
              {
                text: args.math_statement,
              },
            ],
          },
        ],
      },
    ],
    { at: [path] }
  );
  removeNodes(editor, { at: [path - 1] });
};

export const addParagraph = (args: any, editor: MyEditor) => {
  const path = editor.children.length;
  insertNodes(
    editor,
    [
      {
        id: nanoid(),
        type: ELEMENT_PARAGRAPH,
        children: [
          {
            text: args.text,
          },
        ],
      },
    ],
    { at: [path] }
  );
  removeNodes(editor, { at: [path - 1] });
};

export const turnVarToSlider = (args: any, editor: MyEditor) => {
  // sorry... :see_no_evil :face_with_pecking_eye emojis
  const element = editor.children.find(
    (child) =>
      child.type === ELEMENT_VARIABLE_DEF &&
      child.children[0].children[0].text === args.variable_name
  );
  if (element) {
    const path = findNodePath(editor, element);
    setNodes(
      editor,
      { variant: ELEMENT_SLIDER, coerceToType: element.coerceToType },
      { at: path }
    );
  }
};

export const addTable = (args: any, editor: MyEditor) => {
  const table: TableElement = {
    type: ELEMENT_TABLE,
    id: nanoid(),
    children: [
      {
        type: ELEMENT_TABLE_CAPTION,
        id: nanoid(),
        children: [
          {
            type: ELEMENT_TABLE_VARIABLE_NAME,
            id: nanoid(),
            children: [{ text: args.label ?? '' }],
          },
        ],
      },
      {
        type: ELEMENT_TR,
        id: nanoid(),
        children: args.columns.map((value: string) => ({
          type: ELEMENT_TH,
          id: nanoid(),
          cellType: {
            kind: 'anything',
          },
          children: [
            {
              text: value ?? '',
            },
          ],
        })),
      },
      ...args.rows.map(
        (row: string[]): TableRowElement => ({
          type: ELEMENT_TR,
          id: nanoid(),
          children: row.map((value: string) => ({
            type: ELEMENT_TD,
            id: nanoid(),
            children: [{ text: value ?? '' }],
          })),
        })
      ),
    ],
  };

  withoutNormalizing(editor, () => {
    insertNodes(editor, [table], {
      at: [editor.children.length],
    });
  });
};

export const turnVarToInputWidget = (args: any, editor: MyEditor) => {
  // sorry... :see_no_evil :face_with_pecking_eye emojis
  const element = editor.children.find(
    (child) =>
      child.type === ELEMENT_CODE_LINE_V2 &&
      child.children[0].children[0].text === args.variable_name
  );
  if (element && element.children[1]) {
    const path = findNodePath(editor, element);
    const expression = getNodeString(element.children[1]);

    if (path) {
      withoutNormalizing(editor, () => {
        insertNodes(
          editor,
          [
            {
              id: element.blockId,
              type: ELEMENT_VARIABLE_DEF,
              variant: 'expression',
              coerceToType: element.coerceToType,
              children: [
                {
                  type: ELEMENT_CAPTION,
                  children: [{ text: args.variable_name }],
                },
                {
                  type: ELEMENT_EXPRESSION,
                  children: [{ text: expression }],
                },
              ],
            } as VariableDefinitionElement,
          ],
          { at: requirePathBelowBlock(editor, path) }
        );
        removeNodes(editor, { at: path });
        focusEditor(editor);
      });
    }
  }
};

export const uploadFileByUrl = (
  args: any,
  editor: MyEditor,
  computer: RemoteComputer
) => {
  const path = [editor.children.length - 1];
  switch (args.file_type) {
    case 'image':
      return insertImageBelow(editor, path, args.url);
    case 'embed':
      return insertEmbedBelow(editor, path, args.url);
    case 'data':
      return insertLiveConnection({
        computer,
        editor,
        url: args.url,
        path,
        source: 'csv',
      });
    default:
      // not implemented yet
      return noop;
  }
};
