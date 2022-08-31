import { MyEditor } from '@decipad/editor-types';
import { Computer, Program } from '@decipad/computer';
import { elementToLanguageBlock } from './elementToLanguageBlock';
import { ParseError } from './types';

export interface DocumentToProgramReturn {
  program: Program;
  parseErrors: ParseError[];
}

export const editorToProgram = async (
  editor: MyEditor,
  computer: Computer
): Promise<DocumentToProgramReturn> => {
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
