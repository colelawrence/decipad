import {
  IdentifiedResult,
  isBracketError,
  isSyntaxError,
} from '@decipad/computer';
import { Path } from 'slate';
import { DECORATE_SYNTAX_ERROR } from '@decipad/editor-types';
import { SyntaxErrorAnnotation } from '../../types';

export function getSyntaxErrorRanges(
  path: Path,
  lineResult: IdentifiedResult | undefined
): SyntaxErrorAnnotation[] {
  if (lineResult == null || !lineResult.isSyntaxError) {
    return [];
  }

  if (isSyntaxError(lineResult.error) && lineResult.error.token != null) {
    const { token } = lineResult.error;
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

  if (
    isBracketError(lineResult.error?.bracketError) &&
    lineResult.error?.bracketError != null
  ) {
    const { bracketError } = lineResult.error;
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
