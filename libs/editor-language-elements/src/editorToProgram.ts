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
  let program: Program = [];
  let parseErrors: ParseError[] = [];

  for (const element of editor.children) {
    if (!('type' in element) || !('id' in element)) {
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const blockResult = await elementToLanguageBlock(editor, computer, element);
    if (!blockResult) {
      continue;
    }

    const { program: elementProgram, parseErrors: elementParseErrors } =
      blockResult;
    if (elementProgram != null) {
      program = program.concat(elementProgram);
    }
    if (elementParseErrors) {
      parseErrors = parseErrors.concat(elementParseErrors);
    }
  }

  return { program, parseErrors };
};
