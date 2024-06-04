import type { RootDocument, TabElement } from '@decipad/editor-types';
import { createMyPlateEditor } from '@decipad/editor-types';
import type {
  Computer,
  Program,
  ProgramBlock,
} from '@decipad/computer-interfaces';
import { editorToProgram } from './editorToProgram';

export const fullRootEditorToProgram = async (
  doc: RootDocument,
  computer: Computer
): Promise<Program> => {
  let blocks: ProgramBlock[] = [];
  // eslint-disable-next-line no-underscore-dangle
  for (const _block of doc.children.slice(1)) {
    const block = _block as TabElement;
    const tabEditor = createMyPlateEditor();
    tabEditor.children = block.children;
    // eslint-disable-next-line no-await-in-loop
    const tabProgram = await editorToProgram(
      tabEditor,
      block.children,
      computer
    );
    blocks = blocks.concat(tabProgram);
  }
  return blocks;
};
