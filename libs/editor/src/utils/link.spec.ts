import { getTrailingLink } from './link';

describe('getTrailingLink', () => {
  it.each(['[a]b(c)', '[]]()', '[a(b)'])(
    'returns null for the invalid link "%s"',
    async (text) => {
      expect(getTrailingLink(text)).toBe(null);
    }
  );
  it.each(['[a](b)c', '[a][b]\n'])(
    'returns null for the non-trailing link "%s"',
    async (text) => {
      expect(getTrailingLink(text)).toBe(null);
    }
  );

  it('finds the start offset of the link', () => {
    expect(getTrailingLink('ab\ncd[ef](gh)')).toHaveProperty(
      'startOffset',
      'ab\ncd'.length
    );
  });

  it('extracts the text from the link as-is', () => {
    expect(getTrailingLink('[ab**cd**ef](gh)')).toHaveProperty(
      'text',
      'ab**cd**ef'
    );
  });
  it('handles an empty text', () => {
    expect(getTrailingLink('[](gh)')).toHaveProperty('text', '');
  });

  it('extracts the url from the link', () => {
    expect(getTrailingLink('[ab](cd)')).toHaveProperty('url', 'cd');
  });
});
