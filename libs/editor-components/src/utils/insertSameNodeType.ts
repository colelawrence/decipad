import { Computer } from '@decipad/computer-interfaces';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_PARAGRAPH,
  MyElement,
  MyElementOrText,
} from '@decipad/editor-types';
import {
  createStructuredCodeLine,
  generateVarName,
  getCodeLineSource,
} from '@decipad/editor-utils';
import { parseSimpleValue } from '@decipad/remote-computer';
import { nanoid } from 'nanoid';

const PLACEHOLDERS = {
  input: '100$',
  formula: '14 * 3',
};

export const insertSameNodeType = (
  prevNode: MyElement | undefined,
  computer: Computer
): MyElementOrText => {
  const id = nanoid();
  const { input, formula } = PLACEHOLDERS;
  switch (prevNode?.type) {
    case ELEMENT_CODE_LINE_V2: {
      const prevNodeText = getCodeLineSource(prevNode.children[1]);
      const isSimpleValue = !!parseSimpleValue(prevNodeText);
      const autoVarName = computer.getAvailableIdentifier(generateVarName());
      return createStructuredCodeLine({
        id,
        varName: autoVarName,
        code: isSimpleValue ? input : formula,
      });
    }
    case ELEMENT_CODE_LINE:
      return {
        id,
        type: ELEMENT_CODE_LINE,
        children: [{ text: '' }],
      };
    default:
      return {
        id,
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      };
  }
};
