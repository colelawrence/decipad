import {
  ELEMENT_EXPRESSION,
  MyDecorate,
  MyDecorateEntry,
} from '@decipad/editor-types';
import {
  filterDecorate,
  getSyntaxErrorRanges,
  memoizeDecorate,
} from '@decipad/editor-utils';
import { Computer, Token, tokenize } from '@decipad/computer';
import { getNodeString, isElement } from '@udecode/plate';
import { Path, Range } from 'slate';
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

const syntaxDecorations: MyDecorateEntry = ([node, path]) => {
  if (isElement(node) && node.type === ELEMENT_EXPRESSION) {
    const ranges: CodeSyntaxRange[] = [];
    const tokenToRange = withTokenToRange([...path, 0]);
    for (const token of tokenize(getNodeString(node))) {
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
  (computer: Computer): MyDecorateEntry =>
  ([node, path]) => {
    if (isElement(node) && node.type === ELEMENT_EXPRESSION) {
      const { error } = expressionFromEditorSource(
        computer,
        getNodeString(node)
      );

      return getSyntaxErrorRanges(path, {
        blockId: '',
        error,
        isSyntaxError: true,
        results: [],
      });
    }
    return undefined;
  };

export const decorateExpression = (computer: Computer): MyDecorate => {
  const errorDecorations = withErrorDecorations(computer);

  return filterDecorate(
    memoizeDecorate(() => (entry) => {
      const syntax = syntaxDecorations(entry);
      const error = errorDecorations(entry);
      if (!syntax && !error) {
        return undefined;
      }
      return (syntax || []).concat(error || []);
    }),
    ([node]) => node.type === ELEMENT_EXPRESSION
  );
};
