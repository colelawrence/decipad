import { Time } from '@decipad/remote-computer';

const dateFormatsForType: Record<Time.Specificity, string> = {
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

export const dateFormatForGranularity = (
  granularity?: Time.Specificity
): string => {
  return (dateFormatsForType as any)[granularity as any];
};
