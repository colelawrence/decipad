import { SerializedType } from '@decipad/computer';
import { once } from '@decipad/utils';

interface Rounding {
  id: string;
  name: string;
}

const dateRoundings = once(() => [
  { id: 'year', name: 'to the year' },
  { id: 'quarter', name: 'to the quarter' },
  { id: 'month', name: 'to the month' },
  { id: 'day', name: 'to the day' },
]);

const numberRoundings = once(() => [
  { id: '0', name: 'to the unit' },
  { id: '-1', name: 'to the tens place' },
  { id: '-2', name: 'to the hundreds place' },
  { id: '-3', name: 'to the thousands place' },
  { id: '-6', name: 'to the millions place' },
  { id: '1', name: 'to the tenth' },
  { id: '2', name: 'to the hundreth' },
  { id: '3', name: 'to the thousandth' },
  { id: '6', name: 'to the millionth' },
]);

export const availableRoundings = (type: SerializedType): Array<Rounding> => {
  switch (type.kind) {
    case 'date':
      return dateRoundings();
    case 'number':
      return numberRoundings();
  }
  return [];
};
