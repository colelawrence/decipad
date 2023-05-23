// eslint-disable-next-line no-restricted-imports
import { produce as immerProduce, setAutoFreeze, enableMapSet } from 'immer';

setAutoFreeze(false);
enableMapSet();

type TProduce = typeof immerProduce;
type TProduceParams = Parameters<TProduce>;

export const produce: TProduce = ((...args: TProduceParams) => {
  try {
    return immerProduce(...args);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error producing', err);
    // eslint-disable-next-line no-console
    console.error('arguments were', args);
    throw err;
  }
}) as TProduce;
