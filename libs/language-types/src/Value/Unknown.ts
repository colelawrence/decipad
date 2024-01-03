import { Unknown } from '../Unknown';
import type { Value } from './Value';

export const UnknownValue: Value = {
  async getData() {
    return Promise.resolve(Unknown);
  },
};

export const isUnknownValue = (value: Value): boolean => value === UnknownValue;
