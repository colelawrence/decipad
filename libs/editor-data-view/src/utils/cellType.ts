import { SerializedType } from '@decipad/computer';

export const cellType = (type: SerializedType): SerializedType => {
  if (type.kind !== 'column') {
    throw new Error('expected type to be column');
  }
  return type.cellType;
};
