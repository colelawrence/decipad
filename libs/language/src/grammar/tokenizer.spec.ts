import { tokenize } from './tokenizer';

const testTokenizer = (input: string) =>
  tokenize(input)
    .map((t) => `${t.type}(${t.text})`)
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
  expect(testTokenizer('then')).toMatchInlineSnapshot(`"then keyword(then)"`);
});

it('does not crash when it sees an invalid token', () => {
  expect(testTokenizer('"hi')).toMatchInlineSnapshot(`"error(\\"hi)"`);
});
