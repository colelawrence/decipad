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

  constructor(
    initialGlobalScope: AnyMapping<T> | undefined,
    namespaceJoiner: StackNamespaceJoiner<T>,
    namespaceSplitter: StackNamespaceSplitter<T>
  ) {
    this.globalScope = new Map([
      ['', anyMappingToMap(initialGlobalScope ?? new Map())],
    ]);
    this.namespaceJoiner = namespaceJoiner;
    this.namespaceSplitter = namespaceSplitter;
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

  createNamespace(ns: string, varGroup: VarGroup = 'lexical') {
    const scope = this.getAssignmentScope(varGroup);
    if (scope.get('')?.get(ns)) {
      throw new Error(`panic: cannot create the namespace ${ns}`);
    }
    if (!scope.has(ns)) scope.set(ns, new Map());
  }

  set(varName: string, value: T, varGroup: VarGroup = 'lexical') {
    return this.setNamespaced(['', varName], value, varGroup);
  }

  setNamespaced(
    [ns, name]: readonly [namespace: string, name: string],
    value: T,
    varGroup: VarGroup
  ) {
    let asSplitNs;
    if (ns === '' && (asSplitNs = this.namespaceSplitter(value))) {
      this.createNamespace(name);
      for (const [colName, value] of asSplitNs) {
        this.setNamespaced([name, colName], value, varGroup);
      }
      return;
    }

    const map = this.getAssignmentScope(varGroup);

    if (ns === '' && map.has(name)) {
      throw new Error(
        `panic: assigning a value to an existing namespace ${name}`
      );
    }
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

  get(varName: string, varGroup: VarGroup = 'lexical') {
    return this.getNamespaced(['', varName], varGroup);
  }

  getNamespaced(
    [ns, name]: readonly [namespace: string, name: string],
    varGroup: VarGroup
  ) {
    for (const scope of this.getVisibleScopes(varGroup)) {
      if (ns === '' && scope.has(name)) {
        return this.namespaceJoiner(getDefined(scope.get(name)), name);
      }

      if (scope.get(ns)?.has(name)) {
        return getDefined(scope.get(ns)).get(name);
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
}
