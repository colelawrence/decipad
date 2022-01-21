import { SerializedUnits } from '@decipad/language';
import { All, Number, Placeholder, Text } from '../icons';
import { getTypeIcon } from './table';

describe('getTypeIcon()', () => {
  it.each(['day', 'month', 'year', 'minute'] as const)(
    'should return an icon for type date and specificity %s',
    (specificity) => {
      expect(getTypeIcon({ kind: 'date', date: specificity })).toBe(
        Placeholder
      );
    }
  );

  it('should return an icon for type number', () => {
    expect(getTypeIcon({ kind: 'number', unit: null })).toBe(Number);
  });

  it('should return an icon for type number with unit', () => {
    expect(
      getTypeIcon({
        kind: 'number',
        unit: { type: 'units' } as SerializedUnits,
      })
    ).toBe(All);
  });

  it('should return an icon for type string', () => {
    expect(getTypeIcon({ kind: 'string' })).toBe(Text);
  });
});
