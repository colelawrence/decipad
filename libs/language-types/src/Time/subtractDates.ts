import type DeciNumber from '@decipad/number';
import { N } from '@decipad/number';
import type * as Value from '../Value';
import type { Specificity } from './Time';
import { Unknown } from '../Unknown';
import { toLuxonUTC } from './toLuxonUTC';

export const subtractDates = async (
  d1: Value.DateValue,
  d2: Value.DateValue,
  specificity: Specificity
): Promise<DeciNumber | typeof Unknown> => {
  const dd1 = await d1.getData();
  const dd2 = await d2.getData();
  if (dd1 == null || dd2 == null) {
    return Unknown;
  }
  const dateTime1 = await toLuxonUTC(dd1);
  const dateTime2 = await toLuxonUTC(dd2);

  switch (specificity) {
    case 'year': {
      return N(dateTime1.diff(dateTime2, 'years').years);
    }
    case 'month': {
      return N(dateTime1.diff(dateTime2, 'months').months);
    }
    default: {
      return N(dateTime1.diff(dateTime2, 'milliseconds').milliseconds, 1000n);
    }
  }
};
