import { tokenizer, tokenize } from './tokenizer';

const testTokenizer = (input: string) =>
  Array.from(tokenizer.reset(input))
    .map((t) => {
      if (t.type === 'statementSep') return '/stmt/';
      if (t.type?.includes('keyword')) return `<${t.text}>`;
      return `${t.type}(${t.text.replace(/\n/g, '<newline>')})`;
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

it('parses strings using JSON.parse', () => {
  const stringWithBS = '\n\f\b\\/ hello';
  const [stringToken] = tokenize(JSON.stringify(stringWithBS));
  expect(stringToken.value).toEqual(stringWithBS);
});

it('finds identifiers and keywords', () => {
  expect(testTokenizer('helloif')).toMatchInlineSnapshot(
    `"identifier(helloif)"`
  );
  expect(testTokenizer('$ident')).toMatchInlineSnapshot(`"identifier($ident)"`);
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
});
