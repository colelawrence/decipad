export const sheetColumnName = (columnIndex: number): string => {
  let colName = '';
  let dividend = Math.floor(Math.abs(columnIndex));
  let rest;

  while (dividend > 0) {
    rest = (dividend - 1) % 26;
    colName = String.fromCharCode(65 + rest) + colName;
    dividend = parseInt(`${(dividend - rest) / 26}`, 10);
  }
  return colName;
};

export const sheetColumnnIndex = (colName: string): number => {
  const digits = colName.toUpperCase().split('');
  let number = 0;

  for (let i = 0; i < digits.length; i += 1) {
    number += (digits[i].charCodeAt(0) - 64) * 26 ** (digits.length - i - 1);
  }

  return number;
};
