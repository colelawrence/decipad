import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

type Converter = UnitOfMeasure['toBaseQuantity'];
const byte: Converter = (x) => x.mul(8);

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
