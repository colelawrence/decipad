import type { Value } from '@decipad/language-interfaces';

export class BooleanValue implements Value.Value {
  value: boolean;
  constructor(value: boolean) {
    this.value = value;
  }

  static fromValue(value: boolean): BooleanValue {
    return new BooleanValue(value);
  }

  async getData() {
    return Promise.resolve(this.value);
  }
}
