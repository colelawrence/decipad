import { lexer } from './lexer';

const testLexer = (input: string) =>
  Array.from(lexer.reset(input))
    .map((t) => `${t.type}(${t.text})`)
    .join(' ');

it('can go into date mode and back', () => {
  // T is an identifier outside date() and a punctuation for ISO 8601 inside
  expect(testLexer('T date(T) T')).toMatchInlineSnapshot(
    `"identifier(T) ws( ) beginDate(date() punc(T) endDate()) ws( ) identifier(T)"`
  );
});

it('can find numbers and exponents', () => {
  expect(testLexer('100')).toMatchInlineSnapshot(`"number(100)"`);
  expect(testLexer('1.10')).toMatchInlineSnapshot(`"number(1.10)"`);
  expect(testLexer('1e420')).toMatchInlineSnapshot(`"number(1e420)"`);
  expect(testLexer('1.1e-420')).toMatchInlineSnapshot(`"number(1.1e-420)"`);
});

it('can separate exponents', () => {
  expect(testLexer('1e420e69')).toMatchInlineSnapshot(
    `"number(1e420) identifier(e69)"`
  );
  expect(testLexer('1e420ehello')).toMatchInlineSnapshot(
    `"number(1e420) identifier(ehello)"`
  );
});

it('parses strings using JSON.parse', () => {
  const stringWithBS = '\n\f\b\\/ hello';
  const [stringToken] = lexer.reset(JSON.stringify(stringWithBS));
  expect(stringToken.value).toEqual(stringWithBS);
});

it('finds identifiers and keywords', () => {
  expect(testLexer('helloif')).toMatchInlineSnapshot(`"identifier(helloif)"`);
  expect(testLexer('$ident')).toMatchInlineSnapshot(`"identifier($ident)"`);
  expect(testLexer('ident2With3Numbers4')).toMatchInlineSnapshot(
    `"identifier(ident2With3Numbers4)"`
  );
  expect(testLexer('then')).toMatchInlineSnapshot(`"then keyword(then)"`);
});
