import {
  ElementKind,
  ELEMENT_CODE_LINE,
  ELEMENT_FETCH,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  ELEMENT_PLOT,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { createCodeBlockPlugin, createPlateEditor } from '@udecode/plate';
import { execute, SlashCommand } from './slashCommands';

const expectedTypes = {
  table: ELEMENT_TABLE,
  heading1: ELEMENT_H2,
  heading2: ELEMENT_H3,
  import: ELEMENT_FETCH,
  'calculation-block': ELEMENT_CODE_LINE,
  plot: ELEMENT_PLOT,
  input: ELEMENT_VARIABLE_DEF,
};

const getAvailableIdentifier = (prefix: string, start: number) =>
  `${prefix}${start}`;

test.each(Object.entries(expectedTypes) as [SlashCommand, ElementKind][])(
  'command "%s" replaces the block with a "%s" block',
  (command, expectedType) => {
    const editor = createPlateEditor({ plugins: [createCodeBlockPlugin()] });
    editor.children = [
      { type: ELEMENT_PARAGRAPH, children: [{ text: '/cmd' }] },
    ];

    execute({ editor, path: [0, 0], command, getAvailableIdentifier });
    expect(editor.children).toEqual([
      expect.objectContaining({ type: expectedType }),
    ]);
  }
);
