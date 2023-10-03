import { getNodeString } from '@udecode/plate';
import { ELEMENT_CODE_LINE_V2 } from '../../../editor-types/src';
import { assertElementType } from '../utils/assertElementType';
import { Verbalizer } from './types';

export const codeLineVerbalizer: Verbalizer = (element, verbalize) => {
  assertElementType(element, ELEMENT_CODE_LINE_V2);
  const [varName, code] = element.children;
  return `\`\`\`deci
${getNodeString(varName)} = ${verbalize(code)}
\`\`\``;
};
