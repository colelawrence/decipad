import { isElement, ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { tokenize, Token } from '@decipad/language';
import { Node, NodeEntry, Path, Range } from 'slate';
import { DECORATION_CODE_SYNTAX } from '../constants';

export interface CodeSyntaxRange extends Range {
  tokenType: string;
  [DECORATION_CODE_SYNTAX]: true;
}

const withTokenToRange =
  (path: Path) =>
  (token: Token): CodeSyntaxRange | undefined => {
    if (token.type) {
      const start = token.offset;
      const end = start + token.text.length;
      return {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        tokenType: token.type,
        [DECORATION_CODE_SYNTAX]: true,
      };
    }
    return undefined;
  };

export const decorateCodeLine =
  () =>
  ([node, path]: NodeEntry): Range[] => {
    const ranges: CodeSyntaxRange[] = [];
    if (isElement(node) && node.type === ELEMENT_CODE_LINE) {
      const tokenToRange = withTokenToRange([...path, 0]);
      for (const token of tokenize(Node.string(node))) {
        const range = tokenToRange(token);
        if (range) {
          ranges.push(range);
        }
      }
    }
    return ranges;
  };
