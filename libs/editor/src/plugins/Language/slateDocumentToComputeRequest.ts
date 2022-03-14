import {
  Editor,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_PLOT,
  isInteractiveElement,
} from '@decipad/editor-types';
import { ComputeRequest, Program } from '@decipad/language';
import { getCodeFromBlock } from './common';
import {
  getAstBlockFromInteractiveElement,
  getAstFromVarName,
} from './interactiveElements';

export function slateDocumentToComputeRequest(
  slateDoc: Editor['children']
): ComputeRequest {
  const program: Program = [];

  for (const block of slateDoc) {
    if (!('type' in block) || !('id' in block) || block.id == null) {
      continue;
    }

    if (block.type === ELEMENT_CODE_BLOCK) {
      // Add each line of a code block as its own block.
      for (const innerBlock of block.children ?? []) {
        if (innerBlock.id != null && innerBlock.type === ELEMENT_CODE_LINE) {
          program.push({
            id: innerBlock.id,
            type: 'unparsed-block',
            source: getCodeFromBlock(innerBlock),
          });
        }
      }
    }

    if (isInteractiveElement(block)) {
      const parsedBlock = getAstBlockFromInteractiveElement(block);
      if (parsedBlock != null) {
        program.push({
          id: block.id,
          type: 'parsed-block',
          block: parsedBlock,
        });
      }
    }

    if (block.type === ELEMENT_PLOT && block.sourceVarName) {
      program.push({
        id: block.id,
        type: 'parsed-block',
        block: getAstFromVarName(block.id, block.sourceVarName),
      });
    }
  }

  return { program };
}
