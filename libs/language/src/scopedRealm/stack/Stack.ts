import type { AnyReadonlyMapping } from '@decipad/utils';
import { anyMappingToMap, getDefined, identity } from '@decipad/utils';
import type {
  StackNamespaceJoiner,
  StackNamespaceRetrieverHackForTypesystemTables,
  StackNamespaceSplitter,
  TStackFrame,
} from './types';

export class StackFrame<T> implements TStackFrame<T> {
  private parent?: TStackFrame<T>;
  private bindings: Map<string, Map<string, T>>;
  private namespaceJoiner: StackNamespaceJoiner<T>;
  private namespaceSplitter: StackNamespaceSplitter<T>;
  private namespaceRetriever: StackNamespaceRetrieverHackForTypesystemTables<T>;

  private idMap = new Map<string, readonly [string, string]>();

  constructor(
    parent: TStackFrame<T> | undefined,
    initialBindings: AnyReadonlyMapping<T> | undefined,
    namespaceJoiner: StackNamespaceJoiner<T>,
    namespaceSplitter: StackNamespaceSplitter<T>,
    namespaceRetriever: StackNamespaceRetrieverHackForTypesystemTables<T> = identity
  ) {
    this.parent = parent;
    this.bindings = new Map([
      ['', anyMappingToMap(initialBindings ?? new Map())],
    ]);
    this.namespaceJoiner = namespaceJoiner;
    this.namespaceSplitter = namespaceSplitter;
    this.namespaceRetriever = namespaceRetriever;
  }

  *getVisibleScopes(): Generator<Map<string, Map<string, T>>> {
    yield this.bindings;
    if (this.parent) {
      yield* this.parent.getVisibleScopes();
    }
  }

  isNameGlobal(fullName: readonly [string, string]): boolean {
    if (!this.hasNamespaced(fullName)) {
      return false;
    }
    if (!this.parent) {
      return true;
    }
    return !this.hasNamespacedLocalOnly(fullName);
  }

  get globalVariables(): ReadonlyMap<string, T> {
    if (this.parent) {
      return this.parent.globalVariables;
    }
    const out = new Map<string, T>();

    for (const [ns, scope] of this.bindings.entries()) {
      if (ns !== '') out.set(ns, this.namespaceJoiner(scope, ns));
      else {
        for (const [key, val] of scope.entries()) {
          out.set(key, val);
        }
      }
    }

    return out;
  }

  get availableVariables(): ReadonlyMap<string, T> {
    const out = new Map<string, T>();
    for (const oneScope of this.getVisibleScopes()) {
      for (const [ns, scope] of oneScope.entries()) {
        if (ns !== '') out.set(ns, this.namespaceJoiner(scope, ns));
        else {
          for (const [key, val] of scope.entries()) {
            out.set(key, val);
          }
        }
      }
    }

    return out;
  }

  getNamespace(ns: string) {
    for (const scope of this.getVisibleScopes()) {
      const namespace = scope.get(ns);
      if (namespace) return namespace;
    }

    return undefined;
  }

  getNsNameFromId(id: string) {
    return this.idMap.get(id);
  }

  createNamespace(ns: string) {
    if (!this.bindings.has(ns)) this.bindings.set(ns, new Map());
  }

  get namespaces(): Iterable<[string, ReadonlyMap<string, T>]> {
    if (this.parent) {
      return this.parent.namespaces;
    }
    return (function* getNs(globals) {
      for (const [ns, items] of globals.entries()) {
        if (ns !== '') yield [ns, items];
      }
    })(this.bindings);
  }

  set(
    varName: string,
    value: T | undefined,
    id: string | undefined = undefined
  ) {
    if (value != null) {
      return this.setNamespaced(['', varName], value, id);
    }
  }

  // eslint-disable-next-line complexity
  setNamespaced(
    [ns, name]: readonly [namespace: string, name: string],
    value: T,
    id: string | undefined = undefined
  ) {
    let asSplitNs;
    if (ns === '' && (asSplitNs = this.namespaceSplitter(value))) {
      // console.log(`split into `, value, asSplitNs);
      this.createNamespace(name);
      for (const [colName, value] of asSplitNs) {
        this.setNamespaced([name, colName], value);
      }
      return;
    }

    if (id && this.parent == null) {
      // Only set the ID if we're not in a global scope
      if (ns || name !== id) {
        this.idMap.set(id, [ns, name]);
      }
    }

    const map = this.bindings;

    let subMap = map.get(ns);
    if (!subMap) {
      map.set(ns, (subMap = new Map()));
    }
    subMap.set(name, value);
  }

  setMulti(variables: AnyReadonlyMapping<T>) {
    for (const [k, v] of anyMappingToMap(variables).entries()) {
      this.set(k, v);
    }
  }

  has(varName: string) {
    return this.hasNamespaced(['', varName]);
  }

  hasNamespaced([ns, name]: readonly [namespace: string, name: string]) {
    for (const scope of this.getVisibleScopes()) {
      if (ns === '' && scope.has(name)) return true;
      if (scope.get(ns)?.has(name)) return true;
    }
    return false;
  }

  hasNamespacedLocalOnly([ns, name]: readonly [
    namespace: string,
    name: string
  ]) {
    return (
      (ns === '' && this.bindings.has(name)) ||
      (this.bindings.get(ns)?.has(name) ?? false)
    );
  }

  get(varName: string, depth = 0) {
    return this.getNamespaced(['', varName], depth);
  }

  getNamespaced(
    [ns, name]: readonly [namespace: string, name: string],
    depth = 0
  ): T | null {
    // console.log('[ns, name]', [ns, name]);
    const foundWithId = ns === '' && this.idMap.get(name);
    if (foundWithId && depth < 3) {
      return this.getNamespaced(foundWithId, depth + 1);
    }

    for (const scope of this.getVisibleScopes()) {
      if (ns === '' && scope.has(name)) {
        return this.namespaceJoiner(getDefined(scope.get(name)), name);
      }

      if (scope.get(ns)?.has(name)) {
        let value = getDefined(scope.get(ns)?.get(name));
        if (ns !== '') {
          value = this.namespaceRetriever(
            value,
            getDefined(this.get(ns, depth))
          );
        }
        return getDefined(value);
      }
    }

    return null;
  }

  delete(varName: string) {
    return this.deleteNamespaced(['', varName]);
  }

  deleteNamespaced([ns, name]: readonly [namespace: string, name: string]) {
    for (const scope of this.getVisibleScopes()) {
      if (ns === '' && scope.has(name)) {
        scope.delete(name);
      }

      if (scope.get(ns)?.has(name)) {
        scope.get(ns)?.delete(name);
        return;
      }
    }
  }

  push(): TStackFrame<T> {
    return new StackFrame(
      this,
      undefined,
      this.namespaceJoiner,
      this.namespaceSplitter,
      this.namespaceRetriever
    );
  }
}

export const createStack = <T>(
  initialGlobalScope: AnyReadonlyMapping<T> | undefined,
  namespaceJoiner: StackNamespaceJoiner<T>,
  namespaceSplitter: StackNamespaceSplitter<T>,
  namespaceRetriever?:
    | StackNamespaceRetrieverHackForTypesystemTables<T>
    | undefined,
  parentStack?: TStackFrame<T> | undefined
): StackFrame<T> =>
  new StackFrame(
    parentStack,
    initialGlobalScope,
    namespaceJoiner,
    namespaceSplitter,
    namespaceRetriever
  );
