import type { Value } from './Value';

export class BooleanValue implements Value {
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
