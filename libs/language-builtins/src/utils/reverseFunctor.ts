import type { Functor } from '../types';

export const reverseFunctor =
  (functor: Functor): Functor =>
  async (types, values, utils) =>
    functor([...types].reverse(), [...values].reverse(), utils);
