import { lazy, FC } from 'react';

type LazyComponentType<P = {}> = FC<P>;
type LazyComponentTypeModule<P = {}> = {
  default: LazyComponentType<P>;
};

export type Loader<P = {}> = () => Promise<LazyComponentTypeModule<P>>;

const retry = <P = {}>(
  fn: Loader<P>,
  retriesLeft = 5,
  interval = 1000
): Promise<LazyComponentTypeModule<P>> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error: Error) => {
        if (retriesLeft === 0) {
          reject(error);
          return;
        }
        setTimeout(() => {
          // Passing on "reject" is the important part
          retry(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
};

export const lazyLoad = <P = {}>(fn: Loader<P>) => lazy(() => retry(fn));
