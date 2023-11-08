import {
  RootDocument,
  TabElement,
  createTPlateEditor,
} from '@decipad/editor-types';
import {
  RemoteComputer,
  Program,
  ProgramBlock,
} from '@decipad/remote-computer';
import { editorToProgram } from './editorToProgram';

export const fullRootEditorToProgram = async (
  doc: RootDocument,
  computer: RemoteComputer
): Promise<Program> => {
  let blocks: ProgramBlock[] = [];
  // eslint-disable-next-line no-underscore-dangle
  for (const _block of doc.children.slice(1)) {
    const block = _block as TabElement;
    const tabEditor = createTPlateEditor();
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
