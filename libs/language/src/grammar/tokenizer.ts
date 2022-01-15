import moo, { error, Token } from 'moo';
import { BracketCounter, doSeparateStatement } from './containmentCounting';

export { BracketCounter };

const keywordStrings = [
  'if',
  'then',
  'else',
  'true',
  'false',
  'and',
  'in',
  'by',
  'date',
  'through',
  'import_data',
];
const keywords = moo.keywords(
  Object.fromEntries(keywordStrings.map((kw) => [`${kw} keyword`, kw]))
);

export const tokenRules = {
  main: {
    ws: { match: /[ \t\n\v\f]+/, lineBreaks: true },

    // Punctuation
    notEquals: '!=',
    equals: '==',
    lessThanOrEquals: '<=',
    greaterThanOrEquals: '>=',
    arrow: '=>',
    twoStars: '**',
    threeDots: '...',
    twoDots: '..',

    dot: '.',
    bang: '!',
    percent: '%',
    leftParen: '(',
    rightParen: ')',
    leftSquareBracket: '[',
    rightSquareBracket: ']',
    leftCurlyBracket: '{',
    rightCurlyBracket: '}',
    minus: '-',
    plus: '+',
    times: '*',
    caret: '^',
    slash: '/',
    lessThan: '<',
    greaterThan: '>',
    colon: ':',
    comma: ',',
    equalSign: '=',

    andSign: '&&',
    orSign: '||',

    // Move into the "date" state
    // https://www.npmjs.com/package/moo#states
    beginDate: {
      match: /date *\(/,
      push: 'date',
    },

    identifier: {
      match: /[a-zA-Zμ°€£$$][a-zA-Z0-9_μ°€£$$]*/,
      type: keywords,
    },
    number: /[0-9]+(?:\.[0-9]+)?/,
    string: {
      // Adding control characters to comply with https://json.org
      /* eslint-disable-next-line no-control-regex */
      match: /"(?:[^\\"\0-\x1F\x7F]|\\u[0-9a-fA-F]{4}|\\["\\/bfnrt])+"/,
      value: (validJsonString: string) => JSON.parse(validJsonString),
    },
    // Moo crashes by default, but we can give it an error token to return us
    error,
  },
  date: {
    digits: /[0-9]+/,
    punc: /[T.:/+-]/,
    ws: /[ \t]+/,
    monthName: /[a-zA-Z]+/,
    endDate: {
      match: /\)/,
      pop: 1,
    },
    // See above. This needs to be passed into date mode as well
    error,
  },
} as const;

export const STATEMENT_SEP_TOKEN_TYPE = 'statementSep';

const basicTokenizer = moo.states(tokenRules);

export interface ParensCountingTokenizer extends moo.Lexer {
  peek: () => moo.Token | undefined;
  prev: () => moo.Token | undefined;
}
/**
 * A tokenizer that keeps track of how many parens are open,
 * so that it knows when there's a new statement.
 *
 * Emits the special token type "statementSep" for this purpose
 */
export const tokenizer = (() => {
  let openCounter = new BracketCounter();
  let peeked: moo.Token | undefined;
  let prev: moo.Token | undefined;

  const getNextToken = () => {
    if (peeked) {
      const tok = peeked;
      peeked = undefined;
      return tok;
    }
    return basicTokenizer.next();
  };

  const extendedTokenizer: ParensCountingTokenizer = Object.assign(
    Object.create(basicTokenizer),
    {
      next() {
        const tok = getNextToken();
        openCounter.feed(tok);

        if (
          tok &&
          doSeparateStatement({
            tok,
            prevTok: this.prev(),
            nextTok: this.peek(),
            openCounter,
          })
        ) {
          // Clear any negative parens
          openCounter = new BracketCounter();

          prev = Object.assign(Object.create(tok), {
            type: STATEMENT_SEP_TOKEN_TYPE,
          });
        } else {
          prev = tok;
        }

        return prev;
      },
      peek() {
        // if peek() has been called already, don't call next() again
        if (peeked) return peeked;

        peeked = basicTokenizer.next();
        return peeked;
      },
      prev() {
        return prev;
      },
      reset(code: string, info?: moo.LexerState) {
        openCounter = new BracketCounter();
        basicTokenizer.reset(code, info);
        peeked = undefined;
        return this;
      },
    }
  );

  return extendedTokenizer;
})();

export const tokenize = (source: string): Token[] =>
  Array.from(tokenizer.reset(source));
