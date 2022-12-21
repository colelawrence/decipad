import {
  ELEMENT_CODE_LINE_V2,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { getCodeLineSource } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';

export const getUnparsedBlockFromCodeLineV2 = async (
  _editor: MyEditor,
  _computer: Computer,
  block: MyElement
) => {
  if (block.type === ELEMENT_CODE_LINE_V2) {
    const [vname, sourcetext] = block.children;
    return parseElementAsVariableAssignment(
      block.id,
      getNodeString(vname),
      getCodeLineSource(sourcetext)
    );
  }
  return [];
};

export const CodeLineV2: InteractiveLanguageElement = {
  type: ELEMENT_CODE_LINE_V2,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    getUnparsedBlockFromCodeLineV2
  ),
};
