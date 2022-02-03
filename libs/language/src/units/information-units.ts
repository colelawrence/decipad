import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

type Converter = UnitOfMeasure['toBaseQuantity'];
const byte: Converter = (x) => x.mul(8);
const invertbyte: Converter = (x) => x.div(8).ceil();

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
    doesNotScaleOnConversion: true,
    toBaseQuantity: byte,
    fromBaseQuantity: invertbyte,
  },
];
