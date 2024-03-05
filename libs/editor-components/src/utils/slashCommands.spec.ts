import {
  createMyPlateEditor,
  ELEMENT_CODE_LINE,
  ELEMENT_FETCH,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  ELEMENT_PLOT,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
  ElementKind,
  SlashCommand,
} from '@decipad/editor-types';
import { getRemoteComputer } from '@decipad/remote-computer';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { execute } from './slashCommands';

const expectedTypes = {
  table: ELEMENT_TABLE,
  heading1: ELEMENT_H2,
  heading2: ELEMENT_H3,
  import: ELEMENT_FETCH,
  'calculation-block': ELEMENT_CODE_LINE,
  'pie-chart': ELEMENT_PLOT,
  input: ELEMENT_VARIABLE_DEF,
};

const getAvailableIdentifier = (prefix: string, start?: number) =>
  `${prefix}${start || '2'}`;

test.each(Object.entries(expectedTypes) as [SlashCommand, ElementKind][])(
  'command "%s" replaces the block with a "%s" block',
  (command, expectedType) => {
    const editor = createMyPlateEditor({
      plugins: [createCodeBlockPlugin()],
    });
    editor.children = [
      { type: ELEMENT_PARAGRAPH, children: [{ text: '/cmd' }] } as never,
    ];

    execute({
      editor,
      computer: getRemoteComputer(),
      path: [0],
      command,
      getAvailableIdentifier,
    });
    expect(editor.children[0]).toHaveType(expectedType);
  }
);
