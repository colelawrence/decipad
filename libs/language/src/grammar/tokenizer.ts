import moo, { error, Token } from 'moo';
import { BracketCounter, doSeparateStatement } from './containmentCounting';

export type { Token };
export { BracketCounter };

const keywordStrings = [
  'if',
  'then',
  'else',
  'true',
  'false',
  'and',
  'in',
  'is',
  'by',
  'date',
  'through',
  'fetch',
  'categories',
  'mod',
  'modulo',
];
const keywords = moo.keywords(
  Object.fromEntries(keywordStrings.map((kw) => [`${kw} keyword`, kw]))
);

/** HACK: Our toolchain doesn't support regex expressions with the /u flag. Using a
 * function adds some indirection to avoid failing the build */
const regexHack = (text: string, flags = 'u') => {
  return new RegExp(text, flags);
};
const identifierRegExp = regexHack(
  '[\\p{L}\\p{Sc}\\p{Emoji_Presentation}_μ°][\\p{L}\\p{Nd}\\p{Sc}\\p{Emoji_Presentation}_μ°]*'
);
export const prefixCurrencies = ['r$', 'R$', '$', '£', '€'];
export const identifierRegExpGlobal = regexHack(
  identifierRegExp.source,
  `${identifierRegExp.flags}g`
);

export const tokenRules = {
  main: {
    ws: { match: regexHack('[ \\t\\n\\v\\f]+'), lineBreaks: true },

    // Punctuation
    notEquals: '!=',
    equals: '==',
    lessThanOrEquals: '<=',
    greaterThanOrEquals: '>=',
    arrow: '=>',
    twoStars: '**',
    threeDots: '...',
    threeDotsEllipsis: '…',
    twoDots: '..',

    dot: '.',
    bang: '!',
    percent: '%',
    permille: '‰',
    permyriad: '‱',
    leftParen: '(',
    rightParen: ')',
    leftSquareBracket: '[',
    rightSquareBracket: ']',
    leftCurlyBracket: '{',
    rightCurlyBracket: '}',
    // This is a RegExp because if we use '-', moo will place `\-` (an invalid escape) into
    // a RegExp, and then cause a SyntaxError
    minus: regexHack('-'),
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
      match: regexHack('date *\\('),
      push: 'date',
    },
    numberWithScientificNotation: {
      // This regular expression matches a numeric string in the following format:
      // • [0-9]+ matches one or more digits from 0 to 9.
      // • (?:[ _]*[0-9]+)* matches zero or more occurrences of an optional space or underscore followed by one or more digits from 0 to 9.
      // • (?:\.[0-9]+)? matches an optional decimal point followed by one or more digits from 0 to 9.
      // • (?:e|E) matches the character "e" or "E".
      // • \-?[0-9]+ matches an optional minus sign followed by one or more digits from 0 to 9.
      match: regexHack('[0-9]+(?:[_]*[0-9]+)*(?:\\.[0-9]+)?(?:e|E)-?[0-9]+'),
      value: (splitUp: string) => splitUp.replace(/_+/g, ''),
    },
    number: {
      // This regular expression matches a numeric string in the following format:
      // • [0-9]+ matches one or more digits from 0 to 9.
      // • (?:[ _]*[0-9]+)* matches zero or more occurrences of an optional space or underscore followed by one or more digits from 0 to 9.
      // • (?:\.[0-9]+)? matches an optional decimal point followed by one or more digits from 0 to 9.
      match: regexHack('[0-9]+(?:_*[0-9]+)*(?:\\.[0-9]+)?'),
      value: (splitUp: string) => splitUp.replace(/_+/g, ''),
    },
    currency: prefixCurrencies,
    identifier: {
      match: identifierRegExp,
      type: keywords,
    },
    string: {
      // Adding control characters to comply with https://json.org
      /* eslint-disable-next-line no-control-regex */
      match: regexHack(
        '"(?:\\\\["bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\n"\\\\])*"'
      ),
      value: (validJsonString: string) => JSON.parse(validJsonString),
    },
    altstring: {
      /* eslint-disable-next-line no-control-regex */
      match: regexHack(
        "'(?:\\\\[\"bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\n'\\\\])*'"
      ),
      value: (invalidJSONString: string) => {
        const jsonString = invalidJSONString
          .replaceAll('"', '\\"')
          .replaceAll("'", '"');
        return JSON.parse(jsonString);
      },
    },
    // Moo crashes by default, but we can give it an error token to return us
    error,
  },
  date: {
    digits: regexHack('[0-9]+'),
    punc: regexHack('[T.:/+-]'),
    ws: regexHack('[ \\t]+'),
    monthName: regexHack('[a-zA-Z]+'),
    endDate: {
      match: regexHack('\\)'),
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
