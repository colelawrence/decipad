export type AnyMapping<T> =
  | Map<string, T>
  | { [key: string]: T }
  | Array<[key: string, val: T]>;

export type AnyReadonlyMapping<T> =
  | ReadonlyMap<string, T>
  | { [key: string]: T }
  | ReadonlyArray<[key: string, val: T]>;

export const anyMappingToMap = <T>(
  mapping: AnyReadonlyMapping<T>
): Map<string, T> => {
  if (mapping instanceof Map || Array.isArray(mapping)) {
    return new Map(mapping);
  }
  return new Map(Object.entries(mapping));
};

export const anyMappingSize = <T>(mapping: AnyReadonlyMapping<T>): number => {
  if (mapping instanceof Map) {
    return mapping.size;
  }

  if (Array.isArray(mapping)) {
    return mapping.length;
  }

  return Object.keys(mapping).length;
};
