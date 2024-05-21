import type { Value } from '@decipad/language-interfaces';
import { DateValue } from './Date';
import { NumberValue } from './Number';

export class Range implements Value.Value {
  start: Value.Value;
  end: Value.Value;

  constructor({ start, end }: Pick<Range, 'start' | 'end'>) {
    this.start = start;
    this.end = end;
  }

  static fromBounds(start: Value.Value, end: Value.Value): Range {
    if (start instanceof DateValue && end instanceof DateValue) {
      return new Range({
        start,
        end: end.getEndDate(),
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
