import { avatarColor } from './avatarColor';

describe('Avatar Color Matching Test', () => {
  // eslint-disable-next-line no-bitwise
  const uuid = (~~(Math.random() * 1e9)).toString(36);
  const words = Array.from({ length: 10000 }, (_, index) => `${uuid}${index}`);

  it('should be deterministic finding colours by word', () => {
    const colors = words.map((word) => avatarColor(word));
    const colors2 = words.map((word) => avatarColor(word));
    expect(colors).toEqual(colors2);
  });
});
