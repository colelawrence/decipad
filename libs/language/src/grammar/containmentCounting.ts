import moo from 'moo';
import { getDefined } from '@decipad/utils';

const parenTypes = ['Paren', 'SquareBracket', 'CurlyBracket', 'PartialIf'];

type ParenType = typeof parenTypes[number];

const openersToTypes: Record<string, ParenType> = {
  leftParen: 'Paren',
  leftSquareBracket: 'SquareBracket',
  leftCurlyBracket: 'CurlyBracket',
  'if keyword': 'PartialIf',
};

const closersToTypes: Record<string, ParenType> = {
  rightParen: 'Paren',
  rightSquareBracket: 'SquareBracket',
  rightCurlyBracket: 'CurlyBracket',
  'else keyword': 'PartialIf',
};

export type BracketError =
  | { type: 'never-opened'; close: moo.Token }
  | { type: 'mismatched-brackets'; open: moo.Token; close: moo.Token }
  | { type: 'never-closed'; open: moo.Token };

/**
 * Keeps track of open ([{}])
 * Helps implement https://xkcd.com/859/
 */
export class BracketCounter {
  openStack: moo.Token[] = [];
  validationError?: BracketError;
  get isValid() {
    return !this.validationError;
  }
  feed(tok?: moo.Token) {
    if (!tok?.type || !this.isValid) return;

    const opener = openersToTypes[tok.type];
    const closer = closersToTypes[tok.type];

    if (opener) this.openStack.push(tok);
    if (closer) {
      const previouslyOpened = this.openStack.pop();
      const previouslyOpenedType = openersToTypes[previouslyOpened?.type ?? ''];

      if (!previouslyOpened) {
        this.validationError = {
          type: 'never-opened',
          close: tok,
        };
      } else if (previouslyOpenedType !== closer) {
        this.validationError = {
          type: 'mismatched-brackets',
          open: previouslyOpened,
          close: tok,
        };
      }
    }
  }
  noBrackets() {
    return !this.isValid || this.openStack.length === 0;
  }
  finalize() {
    if (this.isValid && this.openStack.length) {
      this.validationError = {
        type: 'never-closed',
        open: getDefined(this.openStack.pop()),
      };
    }
  }
}

interface SeparateStatementArgs {
  tok: moo.Token;
  prevTok: moo.Token | null | undefined;
  nextTok: moo.Token | null | undefined;
  openCounter: BracketCounter;
}

export const doSeparateStatement = ({
  tok,
  prevTok,
  nextTok,
  openCounter,
}: SeparateStatementArgs) => {
  const { type, text } = tok;

  if (type === 'ws' && text.includes('\n') && openCounter.noBrackets()) {
    // allow "then" and "else" to head the line for breaking up if exprs
    // And allow to break line after "=>" denoting function
    if (['then keyword', 'else keyword'].includes(nextTok?.type ?? '')) {
      return false;
    }
    return prevTok?.type !== 'arrow';
  }

  return false;
};
