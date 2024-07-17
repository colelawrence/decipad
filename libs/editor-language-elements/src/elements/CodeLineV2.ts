import type { AST } from '@decipad/language-interfaces';
import type { Computer, Program } from '@decipad/computer-interfaces';
import type {
  CodeLineV2Element,
  MinimalRootEditor,
  MyEditor,
} from '@decipad/editor-types';
import { ELEMENT_CODE_LINE_V2, ELEMENT_SMART_REF } from '@decipad/editor-types';
import {
  assertElementType,
  getCodeLineSource,
  isElementOfType,
} from '@decipad/editor-utils';
import { N } from '@decipad/number';
import { parseCell } from '@decipad/parse';
import { getNodeString } from '@udecode/plate-common';
import type { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';

const tryParseAsNumber: InteractiveLanguageElement['getParsedBlockFromElement'] =
  async (_editor, computer, e): Promise<Program> => {
    assertElementType(e, ELEMENT_CODE_LINE_V2);

    const [vname, sourcetext] = e.children;
    const source = getNodeString(sourcetext);

    if (source?.trim()) {
      let parsedInput: AST.Expression | Error | null = null;
      try {
        // First try parsing it as a plain number
        parsedInput = await parseCell(
          computer,
          { kind: 'number', unit: null },
          source
        );
      } catch (err) {
        // do nothing
      }
      if (!(parsedInput instanceof Error || parsedInput == null)) {
        return parseElementAsVariableAssignment(
          e.id ?? '',
          getNodeString(vname),
          parsedInput
        );
      }
    }

    return [];
  };

/**
 * @returns object with program and interpretedAs, so its easier to unit test.
 */
export const parseStructuredCodeLine = async (
  editor: MinimalRootEditor | MyEditor,
  computer: Computer,
  block: CodeLineV2Element
): Promise<{
  interpretedAs: 'code' | 'literal' | 'empty';
  programChunk: Program;
}> => {
  assertElementType(block, ELEMENT_CODE_LINE_V2);

  const [vname, sourcetext] = block.children;

  if (getCodeLineSource(block.children[1])?.trim()) {
    const hasAnySmartRefs = block.children[1].children.some((elm) =>
      isElementOfType(elm, ELEMENT_SMART_REF)
    );
    const asNumber = hasAnySmartRefs
      ? []
      : await tryParseAsNumber(editor, computer, block);

    if (asNumber.length) {
      return {
        interpretedAs: 'literal',
        programChunk: asNumber,
      };
    }

    return {
      interpretedAs: 'code',
      programChunk: parseElementAsVariableAssignment(
        block.id ?? '',
        getNodeString(vname),
        getCodeLineSource(sourcetext)
      ),
    };
  }
  // empty line
  return {
    interpretedAs: 'empty',
    programChunk: parseElementAsVariableAssignment(
      block.id ?? '',
      getNodeString(vname),
      { type: 'literal', args: ['number', N(0)] }
    ),
  };
};

export const CodeLineV2: InteractiveLanguageElement = {
  type: ELEMENT_CODE_LINE_V2,
  getParsedBlockFromElement: async (editor, computer, e) => {
    assertElementType(e, ELEMENT_CODE_LINE_V2);

    const { programChunk } = await parseStructuredCodeLine(editor, computer, e);

    return programChunk;
  },
};
