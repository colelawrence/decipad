import { PromiseOrType } from '@decipad/utils';

export type WithFromArray<T> = {
  __fromArray?: PromiseOrType<Array<T>>;
};
