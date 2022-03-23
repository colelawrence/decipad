import { Editor } from '@decipad/editor-types';
import { Program } from '@decipad/language';
import { elementToLanguageBlock } from './elementToProgramBlock';

export const documentToProgram = (doc: Editor): Program => {
  let program: Program = [];

  for (const element of doc.children) {
    if (!('type' in element) || !('id' in element)) {
      continue;
    }

    const languageBlocks = elementToLanguageBlock(element);
    if (languageBlocks == null) {
      continue;
    }

    program = program.concat(languageBlocks);
  }

  return program;
};
