import { N } from '@decipad/number';
import type { UnitOfMeasure } from './known-units';
import { identity } from '@decipad/utils';
import { invert } from '../utils/invert';

type Converter = UnitOfMeasure['toBaseQuantity'];
const byte: Converter = (x) => x.mul(N(8));

export const units: UnitOfMeasure[] = [
  {
    name: 'bit',
    baseQuantity: 'information',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'byte',
    pretty: 'B',
    baseQuantity: 'information',
    toBaseQuantity: byte,
    fromBaseQuantity: invert(byte),
  },
];
