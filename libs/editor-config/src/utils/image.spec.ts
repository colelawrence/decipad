import { getTrailingImage } from './image';

describe('getTrailingImage', () => {
  it.each(['![a]b(c)', '![]]()', '![a(b)'])(
    'returns null for the invalid image "%s"',
    async (text) => {
      expect(getTrailingImage(text)).toBe(null);
    }
  );

  it.each(['![a](b)c', '![a][b]\n'])(
    'returns null for the non-trailing image "%s"',
    async (text) => {
      expect(getTrailingImage(text)).toBe(null);
    }
  );

  it('finds the start offset of the image', () => {
    expect(getTrailingImage('ab\ncd![hey](http)')).toHaveProperty(
      'startOffset',
      'ab\ncd'.length
    );
  });

  it('finds the start offset of the image (2)', () => {
    expect(getTrailingImage('a![b](c)')).toEqual({
      alt: 'b',
      startOffset: 1,
      url: 'c',
    });
  });

  it('extracts the alt from the image as-is', () => {
    expect(getTrailingImage('![some alt](gh)')).toHaveProperty(
      'alt',
      'some alt'
    );
  });
  it('handles an empty alt', () => {
    expect(getTrailingImage('![](gh)')).toEqual({
      alt: undefined,
      startOffset: 0,
      url: 'gh',
    });
  });

  it('extracts the url from the link', () => {
    expect(getTrailingImage('![ab](cd)')).toHaveProperty('url', 'cd');
  });
});
