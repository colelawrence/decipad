import {
  All,
  Number,
  Calendar,
  Text,
  CheckboxSelected,
  Formula,
} from '../icons';
import {
  getBooleanType,
  getFormulaType,
  getSeriesType,
  getTypeIcon,
} from './table';

describe('getTypeIcon()', () => {
  it.each(['day', 'month', 'year', 'minute'] as const)(
    'should return an icon for type date and specificity %s',
    (specificity) => {
      expect(getTypeIcon({ kind: 'date', date: specificity })).toBe(Calendar);
    }
  );

  it('should return an icon for type number', () => {
    expect(getTypeIcon({ kind: 'number', unit: null })).toBe(Number);
  });

  it('should return an icon for type number with unit', () => {
    expect(getTypeIcon({ kind: 'number', unit: [] })).toBe(All);
  });

  it('should return an icon for type string', () => {
    expect(getTypeIcon({ kind: 'string' })).toBe(Text);
  });

  it('should return an icon for type boolean', () => {
    expect(getTypeIcon({ kind: 'boolean' })).toBe(CheckboxSelected);
  });

  it('should return an icon for type table-formula', () => {
    expect(getTypeIcon({ kind: 'table-formula' })).toBe(Formula);
  });

  it('should return an icon for type series', () => {
    expect(getTypeIcon({ kind: 'series', seriesType: 'date' })).toBe(Calendar);
  });
});

describe('getSeriesType()', () => {
  it('should return a correct series type', () => {
    expect(getSeriesType('date')).toStrictEqual({
      kind: 'series',
      seriesType: 'date',
    });
  });
});

describe('getBooleanType()', () => {
  it('should return a correct boolean type', () => {
    expect(getBooleanType()).toStrictEqual({ kind: 'boolean' });
  });
});

describe('getFormulaType()', () => {
  it('should return a correct formula type', () => {
    expect(getFormulaType()).toStrictEqual({ kind: 'table-formula' });
  });
});
