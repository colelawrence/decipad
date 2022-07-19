import produce from 'immer';
import moo from 'moo';
import { getDefined, thro } from '@decipad/utils';

import { build as t, Type } from '.';

const tokens = moo.compile({
  lt: '<',
  gt: '>',
  comma: ',',
  colon: ':',
  arrow: '->',
  number: /\d+/,
  word: /\w+/,
  WS: { match: /\s+/, lineBreaks: true },
});

export const parseType = (typeSource: string) => {
  const tokenStream = tokenize(typeSource);

  const parsed = parseTypeInner(tokenStream);

  tokenStream.assertAllConsumed();

  return parsed;
};

export const parseFunctionSignature = (sig: string) => {
  const tokenStream = tokenize(sig);

  const expectedArgs = [parseTypeInner(tokenStream)];

  while (tokenStream.token()?.type === 'comma') {
    tokenStream.next();
    expectedArgs.push(parseTypeInner(tokenStream));
  }

  tokenStream.ensure('arrow');

  const returnType = parseTypeInner(tokenStream);

  tokenStream.assertAllConsumed();

  return { expectedArgs, returnType };
};

interface TokenStream {
  token: () => moo.Token | undefined;
  next: () => moo.Token | undefined;
  error: () => Error;
  ensure: (type: string | undefined) => moo.Token | undefined;
  assertAllConsumed: () => void;
}

function parseTypeInner({ token, next, error, ensure }: TokenStream) {
  const parseLiteralNumber = (): number | 'unknown' => {
    const { type, text } = next() ?? thro(error());

    if (type === 'number') {
      return Number(text);
    }

    if (text === 'unknown') {
      return 'unknown';
    }

    throw error();
  };

  const maybeSymbol = (type: Type): Type => {
    const tok = token();
    if (!tok) {
      return type;
    }

    if (tok.type === 'colon') {
      next();
      const word = ensure('word');
      return produce(type, (type) => {
        type.symbol = getDefined(word).text;
      });
    }

    return type;
  };

  const parseWord = (): Type => {
    const { text } = next() ?? thro('unexpected end');

    if (text === 'string' || text === 'number' || text === 'boolean') {
      return maybeSymbol(t[text]());
    }

    if (text === 'column') {
      ensure('lt');
      const cellType = parseWord();
      let columnSize: number | 'unknown' = 'unknown';

      if (token()?.type === 'comma') {
        next();
        columnSize = parseLiteralNumber();
      }
      const col = t.column(cellType, columnSize);
      ensure('gt');
      return maybeSymbol(col);
    }

    if (text === 'range') {
      ensure('lt');
      const rangeOf = parseWord();
      ensure('gt');
      return maybeSymbol(t.range(rangeOf));
    }

    if (text === 'anything') {
      return maybeSymbol(t.anything());
    }

    if (text === 'nothing') {
      return maybeSymbol(t.nothing());
    }

    if (/^[A-Z]+$/.test(text)) {
      // "A" is shorthand for "anything:A"
      return produce(t.anything(), (type) => {
        type.symbol = text;
      });
    }

    throw error();
  };

  return parseWord();
}

function tokenize(typeSource: string): TokenStream {
  tokens.reset(typeSource);

  let curToken = tokens.next();

  const next = () => {
    const consumed = curToken;

    do {
      curToken = tokens.next();
    } while (curToken?.type === 'WS');

    return consumed;
  };

  const ensure = (type: string | undefined) => {
    if (curToken?.type !== type) {
      throw error(`expected ${type}, got `);
    }
    return next();
  };

  const error = (message = 'unexpected ') => {
    const tok = curToken ? `"${curToken.text}"` : '<end>';

    return new Error(message + tok);
  };

  const token = () => curToken;

  const assertAllConsumed = () => {
    if (curToken != null) {
      throw error('unexpected garbage at the end: ');
    }
  };

  return { token, next, error, ensure, assertAllConsumed };
}
