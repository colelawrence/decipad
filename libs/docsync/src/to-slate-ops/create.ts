import { SyncDiff, SyncCollectionType } from '../types';

function createByType(type: SyncCollectionType) {
  return type === 'map' ? {} : type === 'list' ? [] : '';
}

export function opCreate({ obj, type }: SyncDiff, [map, ops]: any) {
  map[obj] = createByType(type);

  return [map, ops];
}
