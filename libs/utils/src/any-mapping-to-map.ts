export type AnyMapping<T> =
  | Map<string, T>
  | { [key: string]: T }
  | Array<[key: string, val: T]>;

export const anyMappingToMap = <T>(mapping: AnyMapping<T>): Map<string, T> => {
  if (mapping instanceof Map || Array.isArray(mapping)) {
    return new Map(mapping);
  }
  return new Map(Object.entries(mapping));
};
