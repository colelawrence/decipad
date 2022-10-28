import { MyEditor } from '@decipad/editor-types';
import type { Computer, ComputeRequest, Program } from '@decipad/computer';
import { elementToLanguageBlocks } from './elementToLanguageBlock';

export const editorToProgram = async (
  editor: MyEditor,
  computer: Computer
): Promise<ComputeRequest> => {
  const program: Program = [];

  for (const element of editor.children) {
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

  return { program };
};
