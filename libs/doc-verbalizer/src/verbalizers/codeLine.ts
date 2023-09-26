import { getNodeString } from '@udecode/plate';
import { AnyElement, ELEMENT_CODE_LINE_V2 } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';

export const codeLineVerbalizer = (element: AnyElement): string => {
  assertElementType(element, ELEMENT_CODE_LINE_V2);
  const [varName, code] = element.children;
  return `\`\`\`deci\n${getNodeString(varName)} = ${getNodeString(
    code
  )}\n\`\`\``;
};
