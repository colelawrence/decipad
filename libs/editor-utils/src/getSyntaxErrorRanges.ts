import { isSyntaxError, Parser, hasBracketError } from '@decipad/computer';
import { Path } from 'slate';
import { DECORATE_SYNTAX_ERROR } from '@decipad/editor-types';
import { SyntaxErrorAnnotation } from './SyntaxErrorAnnotation';

export function getSyntaxErrorRanges(
  path: Path,
  error: Parser.ParserError | undefined
): SyntaxErrorAnnotation[] {
  if (!error) {
    return [];
  }

  if (isSyntaxError(error) && error.token != null) {
    const { token } = error;
    return [
      {
        anchor: { path, offset: token.offset },
        focus: {
          path,
          offset: token.offset + 1,
        },
        [DECORATE_SYNTAX_ERROR]: true,
        variant: undefined,
      },
    ];
  }

  if (hasBracketError(error) && error?.bracketError != null) {
    const { bracketError } = error;
    return [
      (bracketError.type === 'mismatched-brackets' ||
        bracketError.type === 'never-closed') &&
        bracketError.open,
      (bracketError.type === 'mismatched-brackets' ||
        bracketError.type === 'never-opened') &&
        bracketError.close,
    ]
      .filter((tok): tok is moo.Token => !!tok)
      .map((token) => ({
        anchor: { path, offset: token.offset },
        focus: {
          path,
          offset: token.offset + 1,
        },
        [DECORATE_SYNTAX_ERROR]: true,
        variant: bracketError.type,
      }));
  }

  return [];
}
