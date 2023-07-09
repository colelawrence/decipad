import {
  blue300,
  brand400,
  orange300,
  purple300,
  red300,
  teal300,
} from '../primitives';

const baseColors = [purple300, blue300, brand400, red300, teal300, orange300];

export const avatarColor = (name = '?') => {
  const hashString = name
    .split('')
    .map((c: string) => c.charCodeAt(0))
    .reduce((a: number, b: number) => a + b, 0);
  return baseColors[hashString % baseColors.length];
};
