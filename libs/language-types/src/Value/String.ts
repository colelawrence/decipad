import type { Value } from '@decipad/language-interfaces';

export class StringValue implements Value.Value {
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
