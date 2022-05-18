import { MyValue } from '@decipad/editor-types';
import { Program } from '@decipad/computer';
import { elementToLanguageBlock } from './elementToProgramBlock';

export const documentToProgram = (doc: MyValue): Program => {
  let program: Program = [];

  for (const element of doc) {
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
