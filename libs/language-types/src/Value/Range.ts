import { DateValue } from './Date';
import { NumberValue } from './Number';
import type { Value } from './Value';

export class Range implements Value {
  start: Value;
  end: Value;

  constructor({ start, end }: Pick<Range, 'start' | 'end'>) {
    this.start = start;
    this.end = end;
  }

  static async fromBounds(start: Value, end: Value): Promise<Range> {
    if (start instanceof DateValue && end instanceof DateValue) {
      return new Range({
        start,
        end: await end.getEndDate(),
      });
    } else if (start instanceof NumberValue && end instanceof NumberValue) {
      return new Range({ start, end });
    } else {
      throw new Error(
        `panic: bad Range.fromBounds arguments ${start.constructor.name} and ${end.constructor.name}`
      );
    }
  }

  async getData() {
    return [await this.start.getData(), await this.end.getData()];
  }
}
