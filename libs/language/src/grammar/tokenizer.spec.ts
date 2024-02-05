import stringify from 'json-stringify-safe';
import { tokenizer, tokenize } from './tokenizer';

const testTokenizer = (input: string) =>
  Array.from(tokenizer.reset(input))
    .map((t) => {
      if (t.type === 'statementSep') return '/stmt/';
      const text = typeof t.value === 'string' ? t.value : t.text;
      if (t.type?.includes('keyword')) return `<${text}>`;
      return `${t.type}(${text.replace(/\n/g, '<newline>')})`;
    })
    .join(' ');

it('finds "==" not two "="', () => {
  expect(testTokenizer('==')).toMatchInlineSnapshot(`"equals(==)"`);
  expect(testTokenizer('!=')).toMatchInlineSnapshot(`"notEquals(!=)"`);
  expect(testTokenizer('<=')).toMatchInlineSnapshot(`"lessThanOrEquals(<=)"`);
  expect(testTokenizer('>=')).toMatchInlineSnapshot(
    `"greaterThanOrEquals(>=)"`
  );
  expect(testTokenizer('**')).toMatchInlineSnapshot(`"twoStars(**)"`);
  expect(testTokenizer('..')).toMatchInlineSnapshot(`"twoDots(..)"`);
  expect(testTokenizer('...')).toMatchInlineSnapshot(`"threeDots(...)"`);
  expect(testTokenizer('…')).toMatchInlineSnapshot(`"threeDotsEllipsis(…)"`);
});

it('can go into date mode and back', () => {
  // T is an identifier outside date() and a punctuation for ISO 8601 inside
  expect(testTokenizer('T date(T) T')).toMatchInlineSnapshot(
    `"identifier(T) ws( ) beginDate(date() punc(T) endDate()) ws( ) identifier(T)"`
  );
});

it('can find numbers', () => {
  expect(testTokenizer('100')).toMatchInlineSnapshot(`"number(100)"`);
  expect(testTokenizer('1.10')).toMatchInlineSnapshot(`"number(1.10)"`);
});

it('can find numbers with basic thousands separators', () => {
  expect(testTokenizer('100_000')).toMatchInlineSnapshot(`"number(100000)"`);
});

it('accepts some currencies', () => {
  expect(testTokenizer('$100 £100 €100')).toMatchInlineSnapshot(
    `"currency($) number(100) ws( ) currency(£) number(100) ws( ) currency(€) number(100)"`
  );
  expect(testTokenizer('r$10 R$10')).toMatchInlineSnapshot(
    `"currency(r$) number(10) ws( ) currency(R$) number(10)"`
  );
});

it('parses strings using JSON.parse', () => {
  const stringWithBS = '\n\f\b\\/ hello';
  const [stringToken] = tokenize(stringify(stringWithBS));
  expect(stringToken.value).toEqual(stringWithBS);
});

it('finds identifiers and keywords', () => {
  expect(testTokenizer('🔥')).toMatchInlineSnapshot(`"identifier(🔥)"`);
  expect(testTokenizer('helloif')).toMatchInlineSnapshot(
    `"identifier(helloif)"`
  );
  expect(testTokenizer('$ident')).toMatchInlineSnapshot(
    `"currency($) identifier(ident)"`
  );
  expect(testTokenizer('ident2With3Numbers4')).toMatchInlineSnapshot(
    `"identifier(ident2With3Numbers4)"`
  );
  expect(testTokenizer('then')).toMatchInlineSnapshot(`"<then>"`);
});

it('does not crash when it sees an invalid token', () => {
  expect(testTokenizer('"hi')).toMatchInlineSnapshot(`"error(\\"hi)"`);
});

it('does not crash when it sees an invalid token in date mode', () => {
  expect(testTokenizer('date(")')).toMatchInlineSnapshot(
    `"beginDate(date() error(\\"))"`
  );
});

it('regression: does not crash with multiple line strings', () => {
  expect(testTokenizer('"hello\nworld"')).toMatchInlineSnapshot(
    `"error(\\"hello<newline>world\\")"`
  );
});

describe('extended tokenizer', () => {
  it('finds statement-ending lines', () => {
    expect(testTokenizer('1\n+\n1')).toMatchInlineSnapshot(
      `"number(1) /stmt/ plus(+) /stmt/ number(1)"`
    );
    expect(testTokenizer('(1\n+\n1)')).toMatchInlineSnapshot(
      `"leftParen(() number(1) ws(<newline>) plus(+) ws(<newline>) number(1) rightParen())"`
    );
    expect(testTokenizer(`X=date(2020-01-01)\nY=10`)).toMatchInlineSnapshot(
      `"identifier(X) equalSign(=) beginDate(date() digits(2020) punc(-) digits(01) punc(-) digits(01) endDate()) /stmt/ identifier(Y) equalSign(=) number(10)"`
    );
  });

  it('can peek', () => {
    const tokens = tokenizer.reset('.,!');
    expect(tokens.peek()).toMatchObject({ text: '.' });
    expect(tokens.peek()).toMatchObject({ text: '.' });

    expect(tokens.next()).toMatchObject({ text: '.' });
    expect(tokens.next()).toMatchObject({ text: ',' });
    expect(tokens.next()).toMatchObject({ text: '!' });

    expect(tokens.next()).toEqual(undefined);
    expect(tokens.peek()).toEqual(undefined);
  });

  it('can get the previous tok', () => {
    const tokens = tokenizer.reset('.,!');
    expect(tokens.prev()).toEqual(undefined);
    tokens.next();
    expect(tokens.prev()).toMatchObject({ text: '.' });
    tokens.peek();
    expect(tokens.prev()).toMatchObject({ text: '.' });
    tokens.next();
    expect(tokens.prev()).toMatchObject({ text: ',' });
  });

  it('does not separate statement before an else keyword, or after a function arrow', () => {
    expect(
      testTokenizer('if this\nthen that\nelse that')
    ).toMatchInlineSnapshot(
      `"<if> ws( ) identifier(this) ws(<newline>) <then> ws( ) identifier(that) ws(<newline>) <else> ws( ) identifier(that)"`
    );

    expect(testTokenizer('=>\n1')).toMatchInlineSnapshot(
      `"arrow(=>) ws(<newline>) number(1)"`
    );
  });

  it('can tell an if statement is still "opened"', () => {
    expect(testTokenizer('if\n1')).toMatchInlineSnapshot(
      `"<if> ws(<newline>) number(1)"`
    );
    expect(testTokenizer('if 1 then 2\n')).toMatchInlineSnapshot(
      `"<if> ws( ) number(1) ws( ) <then> ws( ) number(2) ws(<newline>)"`
    );
    // But after an "else" all bets are off
    expect(testTokenizer('if 1 then 2 else\n')).toMatchInlineSnapshot(
      `"<if> ws( ) number(1) ws( ) <then> ws( ) number(2) ws( ) <else> /stmt/"`
    );
  });
});

describe("extended tokenizer's mismatch tracker", () => {
  it('will separate a statement if we are in an invalid state', () => {
    expect(testTokenizer('(]\n')).toMatchInlineSnapshot(
      `"leftParen(() rightSquareBracket(]) /stmt/"`
    );
  });

  it('parses newlines correctly', () => {
    expect(testTokenizer('a = 1\nt = {\n}\nb = 2')).toMatchInlineSnapshot(
      `"identifier(a) ws( ) equalSign(=) ws( ) number(1) /stmt/ identifier(t) ws( ) equalSign(=) ws( ) leftCurlyBracket({) ws(<newline>) rightCurlyBracket(}) /stmt/ identifier(b) ws( ) equalSign(=) ws( ) number(2)"`
    );
  });
});

it('can find `-` after the regex hack', () => {
  expect(testTokenizer('- 1')).toMatchInlineSnapshot(
    `"minus(-) ws( ) number(1)"`
  );
});

describe('Variable delimiter', () => {
  it('can be used with others', () => {
    expect(testTokenizer('`my var`')).toMatchInlineSnapshot(
      `"delimitedIdentifier(my var)"`
    );
  });

  it('tokenizes together with assign', () => {
    expect(testTokenizer('c = `a b`')).toMatchInlineSnapshot(
      `"identifier(c) ws( ) equalSign(=) ws( ) delimitedIdentifier(a b)"`
    );
  });

  it('works with either side', () => {
    expect(
      testTokenizer('var name with spaces = `a b c` * 5')
    ).toMatchInlineSnapshot(
      `"identifier(var) ws( ) identifier(name) ws( ) identifier(with) ws( ) identifier(spaces) ws( ) equalSign(=) ws( ) delimitedIdentifier(a b c) ws( ) times(*) ws( ) number(5)"`
    );
  });
});
