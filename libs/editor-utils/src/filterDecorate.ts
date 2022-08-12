import { MyDecorate, MyElementEntry } from '@decipad/editor-types';

export const filterDecorate =
  (
    decorate: MyDecorate,
    predicate: (entry: MyElementEntry) => boolean
  ): MyDecorate =>
  (...args) =>
  (entry) =>
    predicate(entry as unknown as MyElementEntry)
      ? decorate(...args)(entry)
      : [];
