import {
  IdentifiedError,
  IdentifiedResult,
  isBracketError,
  isSyntaxError,
} from '@decipad/computer';
import { docs } from '@decipad/routing';

export const getSyntaxError = (line?: IdentifiedResult | IdentifiedError) => {
  const error = line?.error;
  if (!error) {
    return undefined;
  }

  return isSyntaxError(error)
    ? {
        line: isSyntaxError(error) && error.line != null ? error.line : 1,
        column: isSyntaxError(error) && error.column != null ? error.column : 1,
        message: error.message,
        detailMessage: error.detailMessage,
        expected: error.expected,
        url: `${docs({}).page({ name: 'errors' }).$}#syntax-error`,
      }
    : isBracketError(error.bracketError)
    ? {
        message: 'Bracket error',
        bracketError: error.bracketError,
        url: `${docs({}).page({ name: 'errors' }).$}#syntax-error`,
      }
    : {
        message: error.message,
        url: docs({}).page({ name: 'errors' }).$,
      };
};
