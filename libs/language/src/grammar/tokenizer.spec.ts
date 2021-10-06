import { tokenizer } from './tokenizer';

const testTokenizer = (input: string) =>
  Array.from(tokenizer.reset(input))
    .map((t) => `${t.type}(${t.text})`)
    .join(' ');

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
  const [stringToken] = tokenizer.reset(JSON.stringify(stringWithBS));
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
