import { MyEditor } from '@decipad/editor-types';
import type { Computer, ComputeRequest, Program } from '@decipad/computer';
import { elementToLanguageBlock } from './elementToLanguageBlock';
import { ParseError } from './types';

export const editorToProgram = async (
  editor: MyEditor,
  computer: Computer
): Promise<ComputeRequest> => {
  const program: Program = [];
  const parseErrors: ParseError[] = [];

  for (const element of editor.children) {
    if (!('type' in element) || !('id' in element)) {
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const blockResult = await elementToLanguageBlock(editor, computer, element);
    if (!blockResult) {
      continue;
    }

    program.push(...blockResult.program);
    parseErrors.push(...blockResult.parseErrors);
  }

  return { program, parseErrors };
};
