import type { Result, Value } from '@decipad/language-interfaces';
import DeciNumber from '@decipad/number';

export class Trend implements Value.Value {
  first: DeciNumber | undefined;
  last: DeciNumber | undefined;
  diff: DeciNumber | undefined;

  constructor(
    first: DeciNumber | undefined,
    last: DeciNumber | undefined,
    diff: DeciNumber | undefined
  ) {
    this.first = first;
    this.last = last;
    this.diff = diff;
  }
  async getData(): Promise<Result.OneResult> {
    return this;
  }

  static from(
    first: DeciNumber | undefined,
    last: DeciNumber | undefined,
    diff: DeciNumber | undefined = first && last ? last.sub(first) : undefined
  ) {
    return new Trend(first, last, diff);
  }
}

export const isTrendValue = (v: unknown): v is Trend => v instanceof Trend;

export const getTrendValue = (v: unknown): Trend | undefined => {
  if (v instanceof Trend) {
    return v;
  }
  return undefined;
};
