import { Unknown } from '@decipad/language-interfaces';
import type { Value } from '@decipad/language-interfaces';

export const UnknownValue: Value.Value = {
  async getData() {
    return Promise.resolve(Unknown);
  },
};

export const isUnknownValue = (value: Value.Value): boolean =>
  value === UnknownValue;
