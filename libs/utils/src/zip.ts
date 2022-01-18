import { lenientZip } from './lenient-zip';

export const zip = <K, V>(keys: K[], values: V[]): [K, V][] => {
  if (keys.length !== values.length) {
    throw new Error('panic: cannot zip arrays of different lengths');
  }

  return lenientZip(keys, values) as [K, V][];
};
