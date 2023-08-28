import { AnyMapping, anyMappingToMap, getDefined } from '@decipad/utils';

export type VarGroup =
  // Global variables
  | 'global'
  // Arguments and variables in the current function
  | 'function'
  // The temporary scope (and if not found, function and global)
  | 'lexical';

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
export class Stack<T> {
  private globalScope: Map<string, Map<string, T>>;

  /** Current function scope. Cannot be lexically nested */
  private functionScope: Map<string, Map<string, T>> | undefined = undefined;
  /** Non-call scopes that can be pushed and popped. Used within tables for storing column names */
  private temporaryScopes: Map<string, Map<string, T>>[] = [];
  private namespaceJoiner: StackNamespaceJoiner<T>;
  private namespaceSplitter: StackNamespaceSplitter<T>;
  private namespaceRetriever: StackNamespaceRetrieverHackForTypesystemTables<T>;

  private idMap = new Map<string, readonly [string, string]>();

  constructor(
    initialGlobalScope: AnyMapping<T> | undefined,
    namespaceJoiner: StackNamespaceJoiner<T>,
    namespaceSplitter: StackNamespaceSplitter<T>,
    namespaceRetriever: StackNamespaceRetrieverHackForTypesystemTables<T> = (
      x
    ) => x
  ) {
    this.globalScope = new Map([
      ['', anyMappingToMap(initialGlobalScope ?? new Map())],
    ]);
    this.namespaceJoiner = namespaceJoiner;
    this.namespaceSplitter = namespaceSplitter;
    this.namespaceRetriever = namespaceRetriever;
  }

  private *getVisibleScopes(varGroup: VarGroup = 'lexical') {
    if (varGroup === 'lexical') {
      for (let i = this.temporaryScopes.length - 1; i >= 0; i--) {
        yield this.temporaryScopes[i];
      }
    }
    if (
      this.functionScope &&
      (varGroup === 'lexical' || varGroup === 'function')
    ) {
      yield this.functionScope;
    }
    yield this.globalScope;
  }

  private getAssignmentScope(varGroup: VarGroup = 'lexical') {
    if (varGroup === 'lexical' && this.temporaryScopes.length) {
      return this.temporaryScopes[this.temporaryScopes.length - 1];
    }
    if (
      this.functionScope &&
      (varGroup === 'function' || varGroup === 'lexical')
    ) {
      return this.functionScope;
    }
    return this.globalScope;
  }

  get isInGlobalScope() {
    return !this.functionScope;
  }

  isNameGlobal(
    [ns, name]: readonly [string, string],
    varGroup: VarGroup = 'lexical'
  ) {
    for (const scope of this.getVisibleScopes(varGroup)) {
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

  get namespaces(): Iterable<[string, ReadonlyMap<string, T>]> {
    return (function* getNs(globals) {
      for (const [ns, items] of globals.entries()) {
        if (ns !== '') yield [ns, items];
      }
    })(this.globalScope);
  }

  getNamespace(ns: string, varGroup: VarGroup) {
    for (const scope of this.getVisibleScopes(varGroup)) {
      const namespace = scope.get(ns);
      if (namespace) return namespace;
    }

    return undefined;
  }

  getNsNameFromId(id: string) {
    return this.idMap.get(id);
  }

  createNamespace(ns: string, varGroup: VarGroup = 'lexical') {
    const scope = this.getAssignmentScope(varGroup);
    if (scope.get('')?.get(ns)) {
      throw new Error(`panic: cannot create the namespace ${ns}`);
    }
    if (!scope.has(ns)) scope.set(ns, new Map());
  }

  set(
    varName: string,
    value: T | undefined,
    varGroup: VarGroup = 'lexical',
    id: string | undefined = undefined
  ) {
    if (value != null) {
      return this.setNamespaced(['', varName], value, varGroup, id);
    }
  }

  // eslint-disable-next-line complexity
  setNamespaced(
    [ns, name]: readonly [namespace: string, name: string],
    value: T,
    varGroup: VarGroup,
    id: string | undefined = undefined
  ) {
    let asSplitNs;
    if (ns === '' && (asSplitNs = this.namespaceSplitter(value))) {
      // console.log(`split into `, value, asSplitNs);
      this.createNamespace(name);
      for (const [colName, value] of asSplitNs) {
        this.setNamespaced([name, colName], value, varGroup);
      }
      return;
    }

    if (id && this.isInGlobalScope && !this.temporaryScopes.length) {
      // Only set the ID if we're not in a global scope
      if (ns || name !== id) {
        this.idMap.set(id, [ns, name]);
      }
    }

    const map = this.getAssignmentScope(varGroup);

    let subMap = map.get(ns);
    if (!subMap) {
      map.set(ns, (subMap = new Map()));
    }
    subMap.set(name, value);
  }

  setMulti(variables: AnyMapping<T>, varGroup: VarGroup = 'lexical') {
    for (const [k, v] of anyMappingToMap(variables).entries()) {
      this.set(k, v, varGroup);
    }
  }

  has(varName: string, varGroup: VarGroup = 'lexical') {
    return this.hasNamespaced(['', varName], varGroup);
  }

  hasNamespaced(
    [ns, name]: [namespace: string, name: string],
    varGroup: VarGroup
  ) {
    for (const scope of this.getVisibleScopes(varGroup)) {
      if (ns === '' && scope.has(name)) return true;
      if (scope.get(ns)?.has(name)) return true;
    }
    return false;
  }

  get(varName: string, varGroup: VarGroup = 'lexical', depth = 0) {
    return this.getNamespaced(['', varName], varGroup, depth);
  }

  getNamespaced(
    [ns, name]: readonly [namespace: string, name: string],
    varGroup: VarGroup,
    depth = 0
  ): T | null {
    // console.log('[ns, name]', [ns, name]);
    const foundWithId = ns === '' && this.idMap.get(name);
    if (foundWithId && depth < 3) {
      return this.getNamespaced(foundWithId, varGroup, depth + 1);
    }

    for (const scope of this.getVisibleScopes(varGroup)) {
      if (ns === '' && scope.has(name)) {
        return this.namespaceJoiner(getDefined(scope.get(name)), name);
      }

      if (scope.get(ns)?.has(name)) {
        let value = getDefined(scope.get(ns)?.get(name));
        if (ns !== '') {
          value = this.namespaceRetriever(
            value,
            getDefined(this.get(ns, varGroup, depth))
          );
        }
        return getDefined(value);
      }
    }

    return null;
  }

  delete(varName: string, varGroup: VarGroup = 'lexical') {
    return this.deleteNamespaced(['', varName], varGroup);
  }

  deleteNamespaced(
    [ns, name]: readonly [namespace: string, name: string],
    varGroup: VarGroup
  ) {
    for (const scope of this.getVisibleScopes(varGroup)) {
      if (ns === '' && scope.has(name)) {
        scope.delete(name);
      }

      if (scope.get(ns)?.has(name)) {
        scope.get(ns)?.delete(name);
        return;
      }
    }
  }

  async withPush<T>(wrapper: () => Promise<T>): Promise<T> {
    this.temporaryScopes.push(new Map());

    try {
      return await wrapper();
    } finally {
      getDefined(this.temporaryScopes.pop());
    }
  }

  async withPushCall<T>(wrapper: () => Promise<T>): Promise<T> {
    const preCallTemporaryScope = this.temporaryScopes;
    const preCallFunctionScope = this.functionScope;

    this.temporaryScopes = [];
    this.functionScope = new Map();

    try {
      return await wrapper();
    } finally {
      this.temporaryScopes = preCallTemporaryScope;
      this.functionScope = preCallFunctionScope;
    }
  }

  withPushSync<T>(wrapper: () => T): T {
    this.temporaryScopes.push(new Map());

    try {
      return wrapper();
    } finally {
      getDefined(this.temporaryScopes.pop());
    }
  }

  withPushCallSync<T>(wrapper: () => T): T {
    const preCallTemporaryScope = this.temporaryScopes;
    const preCallFunctionScope = this.functionScope;

    this.temporaryScopes = [];
    this.functionScope = new Map();

    try {
      return wrapper();
    } finally {
      this.temporaryScopes = preCallTemporaryScope;
      this.functionScope = preCallFunctionScope;
    }
  }
}
