import { MyEditor, MyElement } from '@decipad/editor-types';
import type { RemoteComputer, Program } from '@decipad/remote-computer';
import {
  elementToLanguageBlocks,
  interactiveElementTypes,
} from './elementToLanguageBlock';

export { interactiveElementTypes };

export const editorToProgram = async (
  editor: MyEditor,
  blocks: Iterable<MyElement>,
  computer: RemoteComputer
): Promise<Program> => {
  const program: Program = [];

  for (const element of blocks) {
    if (!('type' in element) || !('id' in element)) {
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const blockResult = await elementToLanguageBlocks(
      editor,
      computer,
      element
    );
    if (!blockResult) {
      continue;
    }

    program.push(...blockResult);
  }

  return program;
};
