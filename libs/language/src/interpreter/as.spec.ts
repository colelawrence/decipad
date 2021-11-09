import { l, as, timeQuantity, block } from '../utils';
import { run } from '.';
import { Unit } from '../parser/ast-types';

const nilPos = {
  line: 0,
  column: 0,
  char: 0,
};

const hours: Unit = {
  unit: 'hours',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};

const minutes: Unit = {
  unit: 'minutes',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};

describe('as', () => {
  it('converts time quantity to number', async () => {
    const b = block(as(timeQuantity({ day: 2 }), [hours]));
    expect(await run([b], [0])).toEqual([48]);
  });

  it('converts number to number', async () => {
    const b = block(as(l(2.5, hours), [minutes]));
    expect(await run([b], [0])).toEqual([150]);
  });
});
