import type { Value } from './Value';
import type * as Time from '../Time';
import { cleanDate } from '../Time/cleanDate';
import { addTime } from '../Time/addTime';

export class DateValue implements Value {
  specificity: Time.Specificity;
  moment: bigint | undefined;

  constructor(moment: bigint | undefined, specificity: Time.Specificity) {
    this.moment = moment;
    this.specificity = specificity;
  }

  static fromDateAndSpecificity(
    date: bigint | number | undefined,
    specificity: Time.Specificity
  ): DateValue {
    return new DateValue(cleanDate(date, specificity), specificity);
  }

  async getData() {
    return Promise.resolve(this.moment);
  }

  /**
   * Dates such as month, day and year, have a start and end. getData() gets us the first millisecond of that range. getEnd gets us the last.
   */
  async getEnd() {
    const end = await addTime(this.moment, this.specificity, 1n);
    if (end == null) {
      return undefined;
    }
    return end - 1n;
  }

  async getEndDate() {
    const moment = await this.getEnd();
    return new DateValue(moment, this.specificity);
  }
}
