import { coerceInputToNumber } from './coerceInputToNumber';

describe('coerceInputToNumber', () => {
  describe('Base tests', () => {
    it('should format cell value according to the column type', () => {
      expect(coerceInputToNumber('text')).toBe('text');
      expect(coerceInputToNumber('2021-01-01')).toBe('2021-01-01');
      expect(coerceInputToNumber('1')).toBe('1');
    });

    it('should transform number inputs to a consistent format', () => {
      expect(coerceInputToNumber('1.000,45')).toBe('1000.45');
      expect(coerceInputToNumber('1,000.45')).toBe('1000.45');
      expect(coerceInputToNumber('123,456,789.01')).toBe('123456789.01');
      expect(coerceInputToNumber('1.234.567,89')).toBe('1234567.89');
      expect(coerceInputToNumber('1,234,567.89')).toBe('1234567.89');
      expect(coerceInputToNumber('100,000,000.00')).toBe('100000000.00');
      expect(coerceInputToNumber('123.456.789,012')).toBe('123456789.012');
      expect(coerceInputToNumber('12,345,678.9')).toBe('12345678.9');
      expect(coerceInputToNumber('12.345.678,9')).toBe('12345678.9');
      expect(coerceInputToNumber('123456')).toBe('123456');
      expect(coerceInputToNumber('123,456.789')).toBe('123456.789');
      expect(coerceInputToNumber('1.234.567,89')).toBe('1234567.89');
      expect(coerceInputToNumber('1,000,000')).toBe('1000000');
      expect(coerceInputToNumber('1.000.000')).toBe('1000000');
    });

    it('should not transform number numbers we just cannot know', () => {
      expect(coerceInputToNumber('123,456')).toBe('123,456');
      expect(coerceInputToNumber('123.456')).toBe('123.456');
      expect(coerceInputToNumber('123,456,789')).toBe('123456789');
      expect(coerceInputToNumber('123.456.789')).toBe('123456789');
      expect(coerceInputToNumber('1.0000,45')).toBe('1.0000,45');
      expect(coerceInputToNumber('1,0000.45')).toBe('1,0000.45');
    });

    it('should not transform number inputs that are invalid, ambiguous and unexpected', () => {
      expect(coerceInputToNumber('12,345.678,9')).toBe('12,345.678,9');
      expect(coerceInputToNumber('12.345,678,9')).toBe('12.345,678,9');
      expect(coerceInputToNumber('123.456,789.012')).toBe('123.456,789.012');
    });

    it('should not transform things that are not numbers', () => {
      expect(coerceInputToNumber('abc123')).toBe('abc123');
      expect(coerceInputToNumber('1.23a')).toBe('1.23a');
      expect(coerceInputToNumber('1,23a')).toBe('1,23a');
      expect(coerceInputToNumber('1,23.45')).toBe('1,23.45');
      expect(coerceInputToNumber('1.23.45')).toBe('1.23.45');
    });
  });

  describe('Chaos monkey', () => {
    const generateRandomInput = () => {
      // Function to generate random inputs of various types
      const types = ['number', 'string'];
      const type = types[Math.floor(Math.random() * types.length)];
      switch (type) {
        case 'number':
          return ((Math.random() - 0.5) * 10000).toString();
        case 'string':
          return Math.random().toString(36).substring(7);
        default:
          return '';
      }
    };

    it('should handle a variety of random inputs without crashing', () => {
      for (let i = 0; i < 100; i++) {
        const input = generateRandomInput();
        expect(() => coerceInputToNumber(input)).not.toThrow();
      }
    });
  });
});
