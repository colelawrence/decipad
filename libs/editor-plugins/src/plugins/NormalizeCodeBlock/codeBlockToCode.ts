import { DeprecatedCodeBlockElement } from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';

export function codeBlockToCode(
  codeBlock: Omit<DeprecatedCodeBlockElement, 'id'>
): string {
  return (codeBlock as DeprecatedCodeBlockElement).children
    .map(getNodeString)
    .join('\n');
}
