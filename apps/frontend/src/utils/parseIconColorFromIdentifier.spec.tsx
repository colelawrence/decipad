import { swatchNames } from 'libs/ui/src/utils';
import { parseIconColorFromIdentifier } from './parseIconColorFromIdentifier';
import { userIconKeys } from '@decipad/editor-types';

const validCombos: string[] = [
  'Wallet-Sulu',
  'Heart-Malibu',
  'Plane-Perfume',
  'Sunrise-Sun',
  'Announcement-Sulu',
  'Pin-Sulu',
  'Beach-Sulu',
  'Star-Rose',
  'Key-Sun',
  'Paperclip-Rose',
  'Wallet-Rose',
  'Music-Sulu',
  'Heart-Malibu',
  'Paperclip-Sulu',
  'Percentage-Rose',
  'Heart-Malibu',
  'Key-Sun',
  'Car-Malibu',
  'Health-Rose',
  'Annotation Warning-Sun',
  'Health-Rose',
  'Leaf-Sulu',
  'Server-Sulu',
  'Annotation Warning-Sun',
  'World-Malibu',
  'Spider-Sun',
  'Trophy-Sun',
  'Beach-Sulu',
  'Heart-Malibu',
  'Trophy-Sun',
  'People-Perfume',
  'Annotation Warning-Sun',
  'Shopping Cart-Sun',
  'Coffee-Perfume',
  'Key-Sun',
  'Key-Sun',
  'Battery-Sulu',
  'Paperclip-Malibu',
  'Sunrise-Sun',
  'Annotation Warning-Sun',
  'Crown-Sun',
  'Happy-Malibu',
  'Rocket-Malibu',
  'Key-Sun',
  'Moon-Sulu',
  'People-Malibu',
  'Car-Sulu',
  'Health-Rose',
  'Happy-Malibu',
];

const badCombos = [
  null,
  undefined,
  'foo-',
  '-bar',
  'Doug-Malibu',
  'Car-Blue',
  'Malibu-Car',
  'Coffee Mug-Sulu',
];

describe.each(validCombos)('With valid combo %s', (combo) => {
  it(`should parse ${combo}`, () => {
    const { ok, icon, iconColor } = parseIconColorFromIdentifier(combo);
    expect(ok).toBeTruthy();
    expect(userIconKeys).toContain(icon);
    expect(swatchNames).toContain(iconColor);
  });
});

describe.each(badCombos)('With valid combo %s', (combo) => {
  it(`should not parse ${combo} with a bad term`, () => {
    const { ok, icon, iconColor } = parseIconColorFromIdentifier(combo);
    expect(icon).toBe('Deci');
    expect(iconColor).toBe('Catskill');
    expect(ok).toBeFalsy();
  });
});
