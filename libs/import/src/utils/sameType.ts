import { SerializedType } from '@decipad/computer';
import { dequal } from 'dequal';

export const sameType = (types: SerializedType[]): boolean => {
  if (types.length === 0) {
    return true;
  }
  const firstType = types[0];
  for (const type of types.slice(1)) {
    if (!dequal(type, firstType)) {
      return false;
    }
  }
  return true;
};
