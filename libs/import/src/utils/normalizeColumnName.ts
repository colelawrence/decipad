import { identifierRegExpGlobal } from '@decipad/computer';

export const normalizeColumnName = (_columnName: string): string => {
  let columnName = _columnName.replaceAll('-', '_');
  if (columnName[0].match(/^[0-9]{1}$/)) {
    columnName = `_${columnName}`;
  }
  return columnName.match(new RegExp(identifierRegExpGlobal))?.join('') || '';
};
