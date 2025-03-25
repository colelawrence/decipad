import { Value } from '@decipad/language-interfaces';
import { OneResult } from 'libs/language-interfaces/src/Result';

export class Metric implements Value.Value {
  dates: Value.ColumnLikeValue;
  values: Value.ColumnLikeValue;

  constructor(dates: Value.ColumnLikeValue, values: Value.ColumnLikeValue) {
    this.dates = dates;
    this.values = values;
  }

  static from(dates: Value.ColumnLikeValue, values: Value.ColumnLikeValue) {
    return new Metric(dates, values);
  }

  async getData(): Promise<OneResult> {
    return [await this.dates.getData(), await this.values.getData()];
  }
}

export const isMetricValue = (v: unknown): v is Metric => v instanceof Metric;

export const getMetricValue = (v: unknown): Metric | undefined => {
  if (v instanceof Metric) {
    return v;
  }
  return undefined;
};
