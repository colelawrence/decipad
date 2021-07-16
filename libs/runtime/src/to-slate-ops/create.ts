import { Diff, CollectionType } from 'automerge';

function createByType(type: CollectionType) {
  return type === 'map' ? {} : type === 'list' ? [] : '';
}

export function opCreate({ obj, type }: Diff, [map, ops]: any) {
  map[obj] = createByType(type);

  return [map, ops];
}
