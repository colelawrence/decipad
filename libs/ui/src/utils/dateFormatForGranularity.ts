import { SerializedType, SerializedTypes } from '@decipad/computer';

const dateFormatsForType: Record<SerializedTypes.Date['date'], string> = {
  year: 'yyyy',
  month: 'yyyy-MM',
  day: 'yyyy-MM-dd',
  hour: 'yyyy-MM-dd HH',
  minute: 'yyyy-MM-dd HH:mm',
  second: 'yyyy-MM-dd HH:mm:ss',
  millisecond: 'yyyy-MM-dd HH:mm:ss',
};

export const dateFormatForGranularity = (type?: SerializedType): string => {
  if (type?.kind !== 'date') {
    throw new Error('expected date');
  }
  return dateFormatsForType[type.date];
};
