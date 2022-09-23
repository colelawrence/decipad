import { getDefined, AnyMapping, anyMappingToMap } from '@decipad/utils';

export type VarGroup =
  // Global variables
  | 'global'
  // Arguments and variables in the current function
  | 'function'
  // The temporary scope (and if not found, function and global)
  | 'lexical';

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
  readonly globalVariables: Map<string, T>;

  /** Current function scope. Cannot be lexically nested */
  private functionScope: Map<string, T> | undefined = undefined;
  /** Non-call scopes that can be pushed and popped. Used within tables for storing column names */
  private temporaryScopes: Map<string, T>[] = [];

  constructor(initialGlobalScope: AnyMapping<T> = new Map()) {
    this.globalVariables = anyMappingToMap(initialGlobalScope);
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
    yield this.globalVariables;
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
    return this.globalVariables;
  }

  get isInGlobalScope() {
    return !this.functionScope;
  }

  set(varName: string, value: T, varGroup: VarGroup = 'lexical') {
    this.getAssignmentScope(varGroup).set(varName, value);
  }

  setMulti(variables: AnyMapping<T>, varGroup: VarGroup = 'lexical') {
    for (const [k, v] of anyMappingToMap(variables).entries()) {
      this.set(k, v, varGroup);
    }
  }

  has(varName: string, varGroup: VarGroup = 'lexical') {
    for (const scope of this.getVisibleScopes(varGroup)) {
      if (scope.has(varName)) return true;
    }
    return false;
  }

  get(varName: string, varGroup: VarGroup = 'lexical') {
    for (const scope of this.getVisibleScopes(varGroup)) {
      if (scope.has(varName)) return scope.get(varName);
    }

    return null;
  }

  delete(varName: string, varGroup: VarGroup = 'lexical') {
    for (const scope of this.getVisibleScopes(varGroup)) {
      if (scope.has(varName)) {
        scope.delete(varName);
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
    const preCallTemporaryScopes = this.temporaryScopes;
    const preCallFunctionScope = this.functionScope;

    this.temporaryScopes = [];
    this.functionScope = new Map();

    try {
      return await wrapper();
    } finally {
      this.temporaryScopes = preCallTemporaryScopes;
      this.functionScope = preCallFunctionScope;
    }
  }
}
