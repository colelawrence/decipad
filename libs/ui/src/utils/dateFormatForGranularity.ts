import { SerializedTypes } from '@decipad/computer';
import { CellValueType } from '@decipad/editor-types';

const dateFormatsForType: Record<SerializedTypes.Date['date'], string> = {
  undefined: '',
  year: 'yyyy',
  quarter: "yyyy'Q'q",
  month: 'yyyy-MM',
  day: 'yyyy-MM-dd',
  hour: 'yyyy-MM-dd HH',
  minute: 'yyyy-MM-dd HH:mm',
  second: 'yyyy-MM-dd HH:mm:ss',
  millisecond: 'yyyy-MM-dd HH:mm:ss',
};

export const dateFormatForGranularity = (type?: CellValueType): string => {
  if (type?.kind !== 'date') {
    throw new Error('expected date');
  }
  return dateFormatsForType[type.date];
};
