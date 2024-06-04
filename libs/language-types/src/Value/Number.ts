import type { DeciNumberBase } from '@decipad/number';
import { N } from '@decipad/number';
import type { Value } from '@decipad/language-interfaces';

export class NumberValue implements Value.Value {
  readonly value: DeciNumberBase;

  constructor(varValue: number | bigint | DeciNumberBase) {
    const t = typeof varValue;
    if (t === 'number' || t === 'bigint') {
      this.value = N(varValue as number | bigint);
    } else {
      this.value = varValue as DeciNumberBase;
    }
  }

  async getData() {
    return Promise.resolve(this.value);
  }

  static fromValue(value: number | bigint | DeciNumberBase): NumberValue {
    return new NumberValue(value);
  }
}
