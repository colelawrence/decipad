import { isElement, ELEMENT_EXPRESSION } from '@decipad/editor-types';
import { getSyntaxErrorRanges } from '@decipad/editor-utils';
import { tokenize, Token, Computer } from '@decipad/language';
import { Decorate } from '@udecode/plate';
import { Node, NodeEntry, Path, Range } from 'slate';
import { DECORATION_EXPRESSION_SYNTAX } from '../constants';
import { expressionFromEditorSource } from './expressionFromEditorSource';

export interface CodeSyntaxRange extends Range {
  tokenType: string;
  [DECORATION_EXPRESSION_SYNTAX]: true;
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
        [DECORATION_EXPRESSION_SYNTAX]: true,
      };
    }
    return undefined;
  };

const syntaxDecorations = ([node, path]: NodeEntry): Range[] | undefined => {
  if (isElement(node) && node.type === ELEMENT_EXPRESSION) {
    const ranges: CodeSyntaxRange[] = [];
    const tokenToRange = withTokenToRange([...path, 0]);
    for (const token of tokenize(Node.string(node))) {
      const range = tokenToRange(token);
      if (range) {
        ranges.push(range);
      }
    }
    return ranges;
  }
  return undefined;
};

const withErrorDecorations =
  (computer: Computer) =>
  ([node, path]: NodeEntry): Range[] | undefined => {
    if (isElement(node) && node.type === ELEMENT_EXPRESSION) {
      const { error } = expressionFromEditorSource(computer, Node.string(node));

      return getSyntaxErrorRanges(path, {
        blockId: '',
        error,
        isSyntaxError: true,
        results: [],
      });
    }
    return undefined;
  };

export const decorateExpression = (computer: Computer): Decorate => {
  const errorDecorations = withErrorDecorations(computer);
  return () =>
    (entry: NodeEntry): Range[] | undefined => {
      const syntax = syntaxDecorations(entry);
      const error = errorDecorations(entry);
      if (!syntax && !error) {
        return undefined;
      }
      return (syntax || []).concat(error || []);
    };
};
