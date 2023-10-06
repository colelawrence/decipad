import { unwrapCodeContent } from './unwrapCodeContent';

describe('unwrapCodeContent', () => {
  it('works on no marks:', () => {
    expect(unwrapCodeContent('abc')).toBe('abc');
  });

  it('works with a first mark only:', () => {
    expect(
      unwrapCodeContent(`abc
\`\`\`
hello
darling
`)
    ).toBe('hello\ndarling');
  });

  it('works with two marks:', () => {
    expect(
      unwrapCodeContent(`abc
\`\`\`
hello
darling
\`\`\`
some more
`)
    ).toBe('hello\ndarling');
  });

  it('works with many uneven marks and gets the last:', () => {
    expect(
      unwrapCodeContent(`abc
\`\`\`
should
not
be this
one
\`\`\`
some more
\`\`\`
hello
darling
`)
    ).toBe('hello\ndarling');
  });
});
