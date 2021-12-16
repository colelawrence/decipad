import moo from 'moo';

const parenTypes = ['Paren', 'SquareBracket', 'CurlyBracket'];
const openers = parenTypes.map((type) => `left${type}`);
const closers = parenTypes.map((type) => `right${type}`);

/**
 * Keeps track of open ([{}])
 * Helps implement https://xkcd.com/859/
 */
export class BracketCounter {
  counts: Record<string, number> = {
    Paren: 0,
    SquareBracket: 0,
    CurlyBracket: 0,
  };
  feed(tok?: moo.Token) {
    if (tok?.text.length !== 1) return;

    const opener = openers.indexOf(tok.type ?? '');
    const closer = closers.indexOf(tok.type ?? '');

    const isOpen = opener >= 0;
    const isClose = closer >= 0;

    if (!isOpen && !isClose) return;

    const parenType = parenTypes[isOpen ? opener : closer];

    this.counts[parenType] += isOpen ? 1 : -1;
  }
  noBrackets() {
    return Object.values(this.counts).every((count) => count === 0);
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
