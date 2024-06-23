import { decodeNumber } from '@decipad/remote-computer-codec';
import type { SerializedUnit } from '../types/serializedTypes';
import type { Unit } from '@decipad/language-interfaces';

export const decodeUnit = (unit: SerializedUnit): Unit => {
  return {
    ...unit,
    exp: decodeNumber(new DataView(unit.exp), 0)[0],
    multiplier: decodeNumber(new DataView(unit.multiplier), 0)[0],
    aliasFor: unit.aliasFor?.map(decodeUnit),
  };
};
