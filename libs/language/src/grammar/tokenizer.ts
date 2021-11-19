import moo, { error, Token } from 'moo';

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

export const tokenizer = moo.states({
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
      match: /[a-zA-Z°€£$$][a-zA-Z0-9_°€£$$]*/,
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
});

export const tokenize = (source: string): Token[] =>
  Array.from(tokenizer.reset(source));
