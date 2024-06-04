import type { DeciNumberBase } from '@decipad/number';
import DeciNumber from '@decipad/number';
import { DateValue } from './Date';
import { NumberValue } from './Number';
import { BooleanValue } from './Boolean';
import { StringValue } from './String';
import type { NonColumn } from './NonColumn';

export class Scalar {
  static fromValue(
    value: number | bigint | DeciNumberBase | boolean | string | symbol | Date
  ): NonColumn {
    if (value instanceof Date) {
      return DateValue.fromDateAndSpecificity(value.getTime(), 'millisecond');
    }
    if (value instanceof DeciNumber) {
      return NumberValue.fromValue(value);
    }
    const t = typeof value;
    if (t === 'number' || t === 'bigint') {
      return NumberValue.fromValue(value as number | bigint);
    }
    if (t === 'boolean') {
      return BooleanValue.fromValue(value as boolean);
    }
    return StringValue.fromValue(value as string);
  }
}
