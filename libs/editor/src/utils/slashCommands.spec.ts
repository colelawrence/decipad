import {
  createCodeBlockPlugin,
  createEditorPlugins,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate';
import {
  ElementType,
  ELEMENT_IMPORT_DATA,
  ELEMENT_TABLE_INPUT,
} from './elementTypes';
import { execute, SlashCommand } from './slashCommands';

const expectedTypes: Record<SlashCommand, ElementType> = {
  table: ELEMENT_TABLE_INPUT,
  heading1: ELEMENT_H2,
  heading2: ELEMENT_H3,
  'import-data': ELEMENT_IMPORT_DATA,
  'calculation-block': ELEMENT_CODE_BLOCK,
};

test.each(Object.entries(expectedTypes) as [SlashCommand, ElementType][])(
  'command "%s" replaces the block with a "%s" block',
  (command, expectedType) => {
    const editor = createEditorPlugins({ plugins: [createCodeBlockPlugin()] });
    editor.children = [
      { type: ELEMENT_PARAGRAPH, children: [{ text: '/cmd' }] },
    ];

    execute(editor, [0, 0], command);
    expect(editor.children).toEqual([
      expect.objectContaining({ type: expectedType }),
    ]);
  }
);
