import { tokenize, BracketCounter } from './tokenizer'; // avoid import cycle

const runBracketCounter = (source: string) => {
  const counter = new BracketCounter();
  tokenize(source).forEach((tok) => {
    counter.feed(tok);
  });
  return counter;
};

describe('containment validation', () => {
  it('can validate', () => {
    expect(runBracketCounter('()').isValid).toEqual(true);
    expect(runBracketCounter('([])').isValid).toEqual(true);
    expect(runBracketCounter('(]').isValid).toEqual(false);
    expect(runBracketCounter('([)]').isValid).toEqual(false);
  });

  it('can elaborate on the error', () => {
    expect(runBracketCounter(')').validationError).toMatchObject({
      type: 'never-opened',
      close: { value: ')' }, // moo.Token
    });
    expect(runBracketCounter('[)').validationError).toMatchObject({
      type: 'mismatched-brackets',
      open: { value: '[' },
      close: { value: ')' },
    });
    expect(runBracketCounter('(if )').validationError).toMatchObject({
      type: 'mismatched-brackets',
      open: { value: 'if' },
      close: { value: ')' },
    });
  });

  it('an invalid bracket counter is "spent"', () => {
    expect(runBracketCounter('[) (}').validationError).toMatchObject({
      type: 'mismatched-brackets',
      open: { type: 'leftSquareBracket', value: '[' },
      close: { type: 'rightParen', value: ')' },
    });
    expect(runBracketCounter(')').noBrackets()).toEqual(true);
  });
});
