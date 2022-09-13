import {
  ELEMENT_EXPRESSION,
  MyDecorate,
  MyDecorateEntry,
  MyEditor,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import {
  filterDecorate,
  getSyntaxErrorRanges,
  memoizeDecorate,
} from '@decipad/editor-utils';
import { Token, tokenize } from '@decipad/computer';
import { getNodeString, getParentNode, isElement } from '@udecode/plate';
import { NodeEntry, Path, Range } from 'slate';
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

const withErrorDecorations: MyDecorateEntry = ([node, path]) => {
  if (isElement(node) && node.type === ELEMENT_EXPRESSION) {
    const source = getNodeString(node);
    const { error } = expressionFromEditorSource(source);

    return error ? getSyntaxErrorRanges(path, error) : [];
  }
  return undefined;
};

export const decorateExpression = (editor: MyEditor): MyDecorate => {
  return filterDecorate(
    memoizeDecorate(() => (entry) => {
      const syntax = syntaxDecorations(entry);
      const error = withErrorDecorations(entry);
      if (!syntax && !error) {
        return undefined;
      }
      return (syntax || []).concat(error || []);
    }),
    ([node, path]) => {
      if (node.type === ELEMENT_EXPRESSION) {
        const varDef = getParentNode(
          editor,
          path
        ) as NodeEntry<VariableDefinitionElement>;
        const kind = varDef?.[0].coerceToType?.kind;
        return kind !== 'date';
      }
      return false;
    }
  );
};
