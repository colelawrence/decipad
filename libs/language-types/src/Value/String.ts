import type { Value } from './Value';

export class StringValue implements Value {
  value: string;
  constructor(value: string) {
    this.value = value;
  }

  static fromValue(value: string): StringValue {
    return new StringValue(value);
  }

  async getData() {
    return Promise.resolve(this.value);
  }
}
