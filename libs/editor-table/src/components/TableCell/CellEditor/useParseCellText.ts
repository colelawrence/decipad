import { Computer } from '@decipad/computer-interfaces';
import { ParsedCellValue } from './types';
import { parseCellText } from './serializeCellText';

export const useParseCellText = (
  computer: Computer,
  cellText: string
): ParsedCellValue => {
  return computer.results$.useWithSelector(() =>
    parseCellText(computer, cellText)
  );
};
