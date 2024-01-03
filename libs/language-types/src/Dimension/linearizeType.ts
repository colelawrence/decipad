import { produce } from '@decipad/utils';
import { Type } from '../Type';

export const linearizeType = (type: Type): Type[] =>
  type.cellType ? [type, ...linearizeType(type.cellType)] : [type];

export const deLinearizeType = async (types: Type[]): Promise<Type> => {
  const [initialType, ...rest] = types;
  return (await Type.combine(initialType, ...rest)).mapType(async () => {
    if (types.length === 1) {
      return initialType;
    }
    const cellType = await deLinearizeType(rest);
    return produce(types[0], (type) => {
      type.cellType = cellType;
    });
  });
};
