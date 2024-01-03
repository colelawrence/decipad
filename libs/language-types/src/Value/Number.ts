import DeciNumber, { N } from '@decipad/number';
import type { Value } from './Value';

export class NumberValue implements Value {
  readonly value: DeciNumber;

  constructor(varValue: number | bigint | DeciNumber) {
    const t = typeof varValue;
    if (t === 'number' || t === 'bigint') {
      this.value = N(varValue as number | bigint);
    } else {
      this.value = varValue as DeciNumber;
    }
  }

  async getData() {
    return Promise.resolve(this.value);
  }

  static fromValue(value: number | bigint | DeciNumber): NumberValue {
    return new NumberValue(value);
  }
}
