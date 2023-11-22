import { findNode, isElement, type TNodeEntry } from '@udecode/plate-common';
import {
  type CodeLineElement,
  type CodeLineV2Element,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_TABLE,
  type MyEditor,
  type TableElement,
} from '@decipad/editor-types';
import { matchElementByVariableName } from '../../utils/matchElementByVariableName';

export const findElementByVariableName = (
  editor: MyEditor,
  variableName: string
):
  | TNodeEntry<CodeLineElement | CodeLineV2Element | TableElement>
  | undefined => {
  const nodeEntry = findNode(editor, {
    match: matchElementByVariableName(variableName),
    block: true,
  });
  if (nodeEntry) {
    const [node] = nodeEntry;
    if (
      isElement(node) &&
      'type' in node &&
      (node.type === ELEMENT_CODE_LINE ||
        node.type === ELEMENT_CODE_LINE_V2 ||
        node.type === ELEMENT_TABLE)
    ) {
      return nodeEntry as TNodeEntry<
        CodeLineElement | CodeLineV2Element | TableElement
      >;
    }
  }
  return undefined;
};
