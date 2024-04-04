import type { AnyMapping, PromiseOrType } from '@decipad/utils';

/** Take a mapping of keys to values and join it. Used to join tables */
export type StackNamespaceJoiner<T> = (
  x: ReadonlyMap<string, T>,
  nsName: string
) => T;

/** Take a stack item and split it. Used to split tables ondemand */
export type StackNamespaceSplitter<T> = (
  x: T
) => Iterable<[string, T]> | undefined;

/**
 * MASSIVE HACK
 * Language tables contain the types of "CELLS", not the types of the columns. So we need a callback to raise the dimension of the cells to the column-level.
 */
export type StackNamespaceRetrieverHackForTypesystemTables<T> = (
  x: T,
  container: T
) => T;

export interface Stack<T> {
  isInGlobalScope: boolean;
  depth: number;
  scopedToDepth(depth: number): Stack<T>;
  isNameGlobal([ns, name]: readonly [string, string]): boolean;
  globalVariables: ReadonlyMap<string, T>;

  availableVariables: ReadonlyMap<string, T>;

  namespaces: Iterable<[string, ReadonlyMap<string, T>]>;

  getNamespace(ns: string): Map<string, T> | undefined;
  getNsNameFromId(id: string): readonly [string, string] | undefined;
  createNamespace(ns: string): void;

  set(varName: string, value: T | undefined, id?: string | undefined): void;

  // eslint-disable-next-line complexity
  setNamespaced(
    [ns, name]: readonly [namespace: string, name: string],
    value: T,
    id?: string | undefined
  ): void;

  setMulti(variables: AnyMapping<T>): void;
  has(varName: string): boolean;
  hasNamespaced([ns, name]: [namespace: string, name: string]): boolean;

  get(varName: string, depth?: number): T | null;
  getNamespaced(
    [ns, name]: readonly [namespace: string, name: string],
    depth?: number
  ): T | null;

  delete(varName: string): void;
  deleteNamespaced([ns, name]: readonly [
    namespace: string,
    name: string
  ]): void;

  withPush<T>(wrapper: () => PromiseOrType<T>): Promise<T>;
}
