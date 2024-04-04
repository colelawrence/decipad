import type { AnyReadonlyMapping, PromiseOrType } from '@decipad/utils';
import { anyMappingToMap, getDefined, identity } from '@decipad/utils';
import type {
  Stack,
  StackNamespaceJoiner,
  StackNamespaceRetrieverHackForTypesystemTables,
  StackNamespaceSplitter,
} from './types';

/**
 * Holds scopes, which are maps of variable names to things like Type,
 * Value or whatever!
 *
 * Split into a global scope (always present and visible) and temporary scopes,
 * which you can .push and .pop from as you go into and out of tables or
 * other places where names are temporarily defined.
 *
 * When calling a function, use .pushFunction and .popFunction to replace the
 * temporary scopes and leave only the global variables and a local scope available.
 */
export class StackImpl<T> {
  private globalScope: Map<string, Map<string, T>>;

  /** Non-call scopes that can be pushed and popped. Used within tables for storing column names */
  private temporaryScopes: Map<string, Map<string, T>>[];
  private namespaceJoiner: StackNamespaceJoiner<T>;
  private namespaceSplitter: StackNamespaceSplitter<T>;
  private namespaceRetriever: StackNamespaceRetrieverHackForTypesystemTables<T>;

  private idMap = new Map<string, readonly [string, string]>();

  constructor(
    initialGlobalScope: AnyReadonlyMapping<T> | undefined,
    namespaceJoiner: StackNamespaceJoiner<T>,
    namespaceSplitter: StackNamespaceSplitter<T>,
    namespaceRetriever: StackNamespaceRetrieverHackForTypesystemTables<T> = identity,
    temporaryScopes: Map<string, Map<string, T>>[] = []
  ) {
    this.globalScope = new Map([
      ['', anyMappingToMap(initialGlobalScope ?? new Map())],
    ]);
    this.temporaryScopes = temporaryScopes;
    this.namespaceJoiner = namespaceJoiner;
    this.namespaceSplitter = namespaceSplitter;
    this.namespaceRetriever = namespaceRetriever;
  }

  private *getVisibleScopes() {
    for (let i = this.temporaryScopes.length - 1; i >= 0; i--) {
      yield this.temporaryScopes[i];
    }
    yield this.globalScope;
  }

  private getAssignmentScope() {
    if (this.temporaryScopes.length) {
      return this.temporaryScopes[this.temporaryScopes.length - 1];
    }
    return this.globalScope;
  }

  get isInGlobalScope() {
    return !this.temporaryScopes.length;
  }

  isNameGlobal([ns, name]: readonly [string, string]) {
    for (const scope of this.getVisibleScopes()) {
      if ((ns === '' && scope.has(name)) || scope.get(ns)?.has(name)) {
        return scope === this.globalScope;
      }
    }
    return false;
  }

  get globalVariables(): ReadonlyMap<string, T> {
    const out = new Map<string, T>();

    for (const [ns, scope] of this.globalScope.entries()) {
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

  get depth(): number {
    return this.temporaryScopes.length;
  }

  scopedToDepth(depth: number) {
    return new StackImpl(
      this.globalVariables,
      this.namespaceJoiner as StackNamespaceJoiner<T>,
      this.namespaceSplitter,
      this.namespaceRetriever,
      this.temporaryScopes.slice(0, depth)
    );
  }

  get namespaces(): Iterable<[string, ReadonlyMap<string, T>]> {
    return (function* getNs(globals) {
      for (const [ns, items] of globals.entries()) {
        if (ns !== '') yield [ns, items];
      }
    })(this.globalScope);
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
    const scope = this.getAssignmentScope();
    if (scope.get('')?.get(ns)) {
      throw new Error(`panic: cannot create the namespace ${ns}`);
    }
    if (!scope.has(ns)) scope.set(ns, new Map());
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

    if (id && this.isInGlobalScope && !this.temporaryScopes.length) {
      // Only set the ID if we're not in a global scope
      if (ns || name !== id) {
        this.idMap.set(id, [ns, name]);
      }
    }

    const map = this.getAssignmentScope();

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

  hasNamespaced([ns, name]: [namespace: string, name: string]) {
    for (const scope of this.getVisibleScopes()) {
      if (ns === '' && scope.has(name)) return true;
      if (scope.get(ns)?.has(name)) return true;
    }
    return false;
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

  async withPush<T>(wrapper: () => PromiseOrType<T>): Promise<T> {
    this.temporaryScopes.push(new Map());

    try {
      return await wrapper();
    } finally {
      getDefined(this.temporaryScopes.pop());
    }
  }
}

export const createStack = <T>(
  initialGlobalScope: AnyReadonlyMapping<T> | undefined,
  namespaceJoiner: StackNamespaceJoiner<T>,
  namespaceSplitter: StackNamespaceSplitter<T>,
  namespaceRetriever?: StackNamespaceRetrieverHackForTypesystemTables<T>
): Stack<T> =>
  new StackImpl(
    initialGlobalScope,
    namespaceJoiner,
    namespaceSplitter,
    namespaceRetriever
  );
