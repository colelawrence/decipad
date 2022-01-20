import { splitCodeIntoStatements } from './splitCodeIntoStatements';

describe('splitCodeIntoStatements', () => {
  it('works on empty string', () => {
    expect(splitCodeIntoStatements('')).toHaveLength(0);
  });

  it('works on one line of code with no parens', () => {
    expect(splitCodeIntoStatements('a = 2')).toMatchInlineSnapshot(`
      Array [
        "a = 2",
      ]
      `);
  });

  it('splits by new line', () => {
    expect(splitCodeIntoStatements('a = 2\nb = 3\nc = 4')).toMatchObject([
      'a = 2',
      'b = 3',
      'c = 4',
    ]);
  });

  it('allows multiline statements with parens', () => {
    expect(
      splitCodeIntoStatements('a = 1\nb = (2\n  +  \n1)\nc = 3')
    ).toMatchObject(['a = 1', 'b = (2\n  +  \n1)', 'c = 3']);
  });

  it('the second of two consecutive code lines ends up in next statement', () => {
    expect(
      splitCodeIntoStatements('a = 1\n\nb = (2\n  +  \n1)\nc = 3')
    ).toMatchObject(['a = 1', '\nb = (2\n  +  \n1)', 'c = 3']);
  });

  it('works with lines ending in white space without eating it', () => {
    expect(
      splitCodeIntoStatements('a = \nb = (2\n  +  \n1)\nc = 3')
    ).toMatchObject(['a = ', 'b = (2\n  +  \n1)', 'c = 3']);
  });
});
