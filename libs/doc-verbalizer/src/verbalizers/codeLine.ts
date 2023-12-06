import { getNodeString } from '../utils/getNodeString';
import { ELEMENT_CODE_LINE_V2 } from '../../../editor-types/src';
import { assertElementType } from '../utils/assertElementType';
import { VarnameToId, Verbalizer } from './types';

export const codeLineVerbalizer: Verbalizer = (element, verbalize) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2);
  const [varName, code] = element.children;
  return `\`\`\`deci\n${getNodeString(varName)} = ${verbalize(code)}\n\`\`\``;
};

export const codeLineVarnameToId: VarnameToId = (element) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2);
  const [varname] = element.children;
  return [getNodeString(varname), element.id];
};
