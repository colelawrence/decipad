import { SerializedType } from '@decipad/language';
import { isTabularType } from './results';

describe('isTabularType function', () => {
  it('should be true for tabular types', () => {
    expect(isTabularType({ kind: 'column' } as SerializedType)).toBe(true);
    expect(isTabularType({ kind: 'row' } as SerializedType)).toBe(true);
    expect(isTabularType({ kind: 'table' } as SerializedType)).toBe(true);
  });

  it('should be false for other types', () => {
    expect(isTabularType({ kind: 'number' } as SerializedType)).toBe(false);
    expect(isTabularType({ kind: 'date' } as SerializedType)).toBe(false);
    expect(isTabularType({ kind: 'function' } as SerializedType)).toBe(false);
  });
});
