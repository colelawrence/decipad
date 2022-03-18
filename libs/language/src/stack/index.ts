import { getDefined } from '@decipad/utils';
import { immerable } from 'immer';
import { AnyMapping, anyMappingToMap } from '../utils';

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
  [immerable] = true;

  readonly globalVariables: Map<string, T>;
  private temporaryScopes: Map<string, T>[] = [];
  private functionScopes: Map<string, T>[][] = [];

  constructor(initialGlobalScope: AnyMapping<T> = new Map()) {
    this.globalVariables = anyMappingToMap(initialGlobalScope);
  }

  *getVisibleScopes() {
    for (let i = this.temporaryScopes.length - 1; i >= 0; i--) {
      yield this.temporaryScopes[i];
    }
    yield this.globalVariables;
  }

  get top(): Map<string, T> {
    return (
      this.temporaryScopes[this.temporaryScopes.length - 1] ??
      this.globalVariables
    );
  }

  set(varName: string, value: T) {
    this.top.set(varName, value);
  }

  setMulti(variables: Map<string, T>) {
    for (const [k, v] of variables.entries()) {
      this.set(k, v);
    }
  }

  has(varName: string) {
    for (const scope of this.getVisibleScopes()) {
      if (scope.has(varName)) return true;
    }
    return false;
  }

  get(varName: string) {
    for (const scope of this.getVisibleScopes()) {
      if (scope.has(varName)) return scope.get(varName);
    }

    return null;
  }

  delete(varName: string) {
    for (const scope of this.getVisibleScopes()) {
      if (scope.has(varName)) {
        scope.delete(varName);
        return;
      }
    }

    throw new Error(`panic: deleting an undefined variable ${varName}`);
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
    this.functionScopes.push(this.temporaryScopes);
    this.temporaryScopes = [new Map()];

    try {
      return await wrapper();
    } finally {
      this.temporaryScopes = getDefined(this.functionScopes.pop());
    }
  }
}
