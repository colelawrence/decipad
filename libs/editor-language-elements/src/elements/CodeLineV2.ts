import { Computer, Program } from '@decipad/computer';
import {
  CodeLineV2Element,
  ELEMENT_CODE_LINE_V2,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import { assertElementType, getCodeLineSource } from '@decipad/editor-utils';
import { N } from '@decipad/number';
import { parseCell } from '@decipad/parse';
import { getNodeString } from '@udecode/plate';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

const tryParseAsNumber = weakMapMemoizeInteractiveElementOutput(
  async (_editor, computer, e: CodeLineV2Element): Promise<Program> => {
    const [vname, sourcetext] = e.children;
    const source = getNodeString(sourcetext);

    if (source?.trim()) {
      // First try parsing it as a plain number
      const parsedInput = await parseCell(
        computer,
        { kind: 'number', unit: null },
        source
      );

      if (!(parsedInput instanceof Error || parsedInput == null)) {
        return parseElementAsVariableAssignment(
          e.id,
          getNodeString(vname),
          parsedInput
        );
      }
    }

    return [];
  }
);

export const parseStructuredCodeLine = weakMapMemoizeInteractiveElementOutput(
  async (
    editor: MyEditor,
    computer: Computer,
    block: MyElement
  ): Promise<{
    interpretedAs: 'code' | 'literal' | 'empty';
    programChunk: Program;
  }> => {
    assertElementType(block, ELEMENT_CODE_LINE_V2);

    const [vname, sourcetext] = block.children;

    if (getCodeLineSource(block.children[1])?.trim()) {
      const asNumber = await tryParseAsNumber(editor, computer, block);

      if (asNumber.length) {
        return {
          interpretedAs: 'literal',
          programChunk: asNumber,
        };
      }

      return {
        interpretedAs: 'code',
        programChunk: parseElementAsVariableAssignment(
          block.id,
          getNodeString(vname),
          getCodeLineSource(sourcetext)
        ),
      };
    }
    // empty line
    return {
      interpretedAs: 'empty',
      programChunk: parseElementAsVariableAssignment(
        block.id,
        getNodeString(vname),
        { type: 'literal', args: ['number', N(0)] }
      ),
    };
  }
);

export const CodeLineV2: InteractiveLanguageElement = {
  type: ELEMENT_CODE_LINE_V2,
  getParsedBlockFromElement: async (editor, computer, e) => {
    assertElementType(e, ELEMENT_CODE_LINE_V2);

    const { programChunk } = await parseStructuredCodeLine(editor, computer, e);

    return programChunk;
  },
};
