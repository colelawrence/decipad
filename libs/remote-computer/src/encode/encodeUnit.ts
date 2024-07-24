import { encodeNumber } from '@decipad/remote-computer-codec';
import type { SerializedUnit } from '../types/serializedTypes';
import type { Unit } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';

export const encodeUnit = (unit: Unit): SerializedUnit => {
  const exp = new Value.GrowableDataView(createResizableArrayBuffer(8));
  const numberLength = encodeNumber(exp, 0, unit.exp);

  const multiplier = new Value.GrowableDataView(createResizableArrayBuffer(8));
  const multiplierLength = encodeNumber(multiplier, 0, unit.multiplier);

  return {
    ...unit,
    exp: exp.seal(numberLength),
    multiplier: multiplier.seal(multiplierLength),
    aliasFor: unit.aliasFor?.map(encodeUnit),
  };
};
