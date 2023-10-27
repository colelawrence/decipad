import { MyDecorate } from '@decipad/editor-types';
import { ENodeEntry, PlateEditor, Value } from '@udecode/plate';

export const filterDecorate =
  <P, TV extends Value, TE extends PlateEditor<TV>>(
    decorate: MyDecorate<P, TV, TE>,
    predicate: (entry: ENodeEntry<TV>) => boolean
  ): MyDecorate<P, TV, TE> =>
  (...args) =>
  (entry) =>
    predicate(entry) ? decorate(...args)(entry) : [];
