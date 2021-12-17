import moo from 'moo';

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

/**
 * Keeps track of open ([{}])
 * Helps implement https://xkcd.com/859/
 */
export class BracketCounter {
  counts: Record<ParenType, number> = {
    Paren: 0,
    SquareBracket: 0,
    CurlyBracket: 0,
    PartialIf: 0,
  };
  feed(tok?: moo.Token) {
    if (!tok?.type) return;

    const opener = openersToTypes[tok.type];
    const closer = closersToTypes[tok.type];

    if (opener) this.counts[opener] += 1;
    if (closer) this.counts[closer] -= 1;
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
