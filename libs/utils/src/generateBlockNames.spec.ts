import {
  generateVarName,
  generateTableName,
  generateInputName,
  generateSliderName,
  generateDropdownName,
  generateColumnName,
} from './generateBlockNames';

describe('generateBlockNames', () => {
  describe('generateVarName', () => {
    it('should return "Variable" when isFlagEnabled is false', () => {
      const result = generateVarName(false);
      expect(result).toEqual('Variable');
    });

    it('should return a generated name when isFlagEnabled is true', () => {
      const result = generateVarName(true);
      expect(result).toMatch(/[a-zA-Z_$][a-zA-Z0-9_$]*/);
    });
  });

  describe('generateTableName', () => {
    it('should return the table name with a prefix', () => {
      const result = generateTableName('My');
      expect(result).toEqual('MyTable');
    });

    it('should return just "Table" when no prefix is provided', () => {
      const result = generateTableName();
      expect(result).toEqual('Table');
    });
  });

  describe('generateInputName', () => {
    it('should return "Input"', () => {
      const result = generateInputName();
      expect(result).toEqual('Input');
    });
  });

  describe('generateSliderName', () => {
    it('should return "Slider"', () => {
      const result = generateSliderName();
      expect(result).toEqual('Slider');
    });
  });

  describe('generateDropdownName', () => {
    it('should return "Dropdown"', () => {
      const result = generateDropdownName();
      expect(result).toEqual('Dropdown');
    });
  });

  describe('generateColumnName', () => {
    it('should return "Column"', () => {
      const result = generateColumnName();
      expect(result).toEqual('Column');
    });
  });
});
