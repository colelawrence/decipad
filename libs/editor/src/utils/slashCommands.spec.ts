import { createCodeBlockPlugin, createEditorPlugins } from '@udecode/plate';
import {
  ELEMENT_FETCH,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE_INPUT,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
  ElementKind,
} from '../elements';
import { execute, SlashCommand } from './slashCommands';

const expectedTypes: Record<SlashCommand, ElementKind> = {
  table: ELEMENT_TABLE_INPUT,
  heading1: ELEMENT_H2,
  heading2: ELEMENT_H3,
  import: ELEMENT_FETCH,
  'calculation-block': ELEMENT_CODE_BLOCK,
};

test.each(Object.entries(expectedTypes) as [SlashCommand, ElementKind][])(
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
