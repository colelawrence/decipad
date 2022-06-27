import { MyEditor } from '@decipad/editor-types';
import { Program } from '@decipad/computer';
import { elementToLanguageBlock } from './elementToLanguageBlock';
import { ParseError } from './types';

export interface DocumentToProgramReturn {
  program: Program;
  parseErrors: ParseError[];
}

export const editorToProgram = (editor: MyEditor): DocumentToProgramReturn => {
  let program: Program = [];
  let parseErrors: ParseError[] = [];

  for (const element of editor.children) {
    if (!('type' in element) || !('id' in element)) {
      continue;
    }

    const blockResult = elementToLanguageBlock(editor, element);
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
